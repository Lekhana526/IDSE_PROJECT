"""
DATA MINER: THE TREASURE HUNT - PLAYER FEEDBACK MANAGER
Persistent SQLite storage, input validation, statistical analytics summary,
and CSV export for peer-testing project documentation.
"""

import os
import sqlite3
import csv
import io
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'datasets', 'player_feedback.db')

def get_db_connection():
    """Initializes and returns a SQLite connection with row factory."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_feedback_db():
    """Creates the player_feedback table if it does not already exist."""
    conn = get_db_connection()
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS player_feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                rating INTEGER NOT NULL,
                difficulty TEXT NOT NULL,
                learning_experience TEXT NOT NULL,
                gameplay_experience TEXT NOT NULL,
                challenging_level TEXT NOT NULL,
                comments TEXT,
                timestamp TEXT NOT NULL
            )
        """)
        conn.commit()
    finally:
        conn.close()

# Ensure table exists on import
init_feedback_db()

def save_feedback(data):
    """
    Validates, sanitizes, and persists a player feedback record.
    Returns a dict with status, record id, and feedback message.
    """
    if not isinstance(data, dict):
        return {"status": "error", "message": "Invalid feedback payload format."}

    # 1. Rating validation (1 to 5)
    try:
        rating = int(data.get("rating", 0))
    except (ValueError, TypeError):
        rating = 0
    if rating < 1 or rating > 5:
        return {"status": "error", "message": "Please provide an overall rating from 1 to 5 stars."}

    # 2. Difficulty validation
    difficulty = str(data.get("difficulty", "")).strip()
    valid_difficulties = ["Easy", "Medium", "Hard", "Very Hard"]
    if difficulty not in valid_difficulties:
        return {"status": "error", "message": f"Please select a game difficulty ({', '.join(valid_difficulties)})."}

    # 3. Learning experience validation
    learning = str(data.get("learning_experience", "")).strip()
    valid_learning = ["Yes, definitely", "Somewhat", "Not really"]
    if learning not in valid_learning:
        return {"status": "error", "message": "Please answer whether the game helped you understand Data Science concepts."}

    # 4. Gameplay experience validation
    gameplay = str(data.get("gameplay_experience", "")).strip()
    valid_gameplay = ["Very interesting", "Interesting", "Average", "Needs improvement"]
    if gameplay not in valid_gameplay:
        return {"status": "error", "message": "Please select your gameplay experience."}

    # 5. Most challenging level validation
    challenging_level = str(data.get("challenging_level", "")).strip()
    valid_levels = [
        "Level 1 – Data Cleaning",
        "Level 2 – EDA and Correlation",
        "Level 3 – K-Means Clustering",
        "Level 4 – Outlier Detection",
        "Level 5 – Regression"
    ]
    if challenging_level not in valid_levels:
        # Allow matching prefix e.g. "Level 1" or level number if shortened
        matched = None
        for vl in valid_levels:
            if challenging_level.lower() in vl.lower():
                matched = vl
                break
        if matched:
            challenging_level = matched
        else:
            return {"status": "error", "message": "Please select which level you found most challenging."}

    # 6. Optional Player Name and Comments
    raw_name = str(data.get("name", "")).strip()
    name = raw_name[:80] if raw_name else "Anonymous Explorer"
    comments = str(data.get("comments", "")).strip()[:1000]

    # 7. Formatted timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db_connection()
    try:
        cursor = conn.execute("""
            INSERT INTO player_feedback (
                name, rating, difficulty, learning_experience,
                gameplay_experience, challenging_level, comments, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, rating, difficulty, learning, gameplay, challenging_level, comments, timestamp))
        conn.commit()
        record_id = cursor.lastrowid
    finally:
        conn.close()

    return {
        "status": "success",
        "id": record_id,
        "message": "THANK YOU, EXPLORER! Your feedback helps us improve DATA MINER."
    }

def get_all_feedback():
    """Returns all feedback records ordered from newest to oldest."""
    conn = get_db_connection()
    try:
        rows = conn.execute("SELECT * FROM player_feedback ORDER BY id DESC").fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

def get_public_reviews(page=1, per_page=8):
    """
    Returns paginated public reviews along with top-level summary metrics.
    Only returns fields safe for public display, sorted newest first.
    """
    all_records = get_all_feedback()
    total = len(all_records)
    avg_rating = round(sum(r["rating"] for r in all_records) / total, 1) if total > 0 else 0.0

    # Pagination bounds
    try:
        page = max(1, int(page))
        per_page = max(1, min(50, int(per_page)))
    except (ValueError, TypeError):
        page = 1
        per_page = 8

    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    paginated_records = all_records[start_idx:end_idx]

    sanitized = []
    for r in paginated_records:
        name = str(r.get("name", "")).strip() or "Anonymous Explorer"
        sanitized.append({
            "id": r["id"],
            "name": name,
            "rating": r["rating"],
            "difficulty": r["difficulty"],
            "learning_experience": r["learning_experience"],
            "gameplay_experience": r["gameplay_experience"],
            "challenging_level": r["challenging_level"],
            "comments": r["comments"] or "",
            "timestamp": r["timestamp"]
        })

    return {
        "status": "success",
        "total_reviews": total,
        "average_rating": avg_rating,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, (total + per_page - 1) // per_page),
        "has_more": end_idx < total,
        "reviews": sanitized
    }

def get_feedback_summary():
    """
    Computes genuine analytics metrics from all actual stored responses.
    No hardcoded or mock data.
    """
    records = get_all_feedback()
    total = len(records)

    if total == 0:
        return {
            "total_players": 0,
            "average_rating": 0.0,
            "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
            "difficulty_distribution": {"Easy": 0, "Medium": 0, "Hard": 0, "Very Hard": 0},
            "difficulty_percentages": {"Easy": 0, "Medium": 0, "Hard": 0, "Very Hard": 0},
            "learning_distribution": {"Yes, definitely": 0, "Somewhat": 0, "Not really": 0},
            "learning_percentages": {"Yes, definitely": 0, "Somewhat": 0, "Not really": 0},
            "learning_useful_percentage": 0.0,
            "gameplay_distribution": {"Very interesting": 0, "Interesting": 0, "Average": 0, "Needs improvement": 0},
            "gameplay_percentages": {"Very interesting": 0, "Interesting": 0, "Average": 0, "Needs improvement": 0},
            "challenging_level_distribution": {
                "Level 1 – Data Cleaning": 0,
                "Level 2 – EDA and Correlation": 0,
                "Level 3 – K-Means Clustering": 0,
                "Level 4 – Outlier Detection": 0,
                "Level 5 – Regression": 0
            },
            "most_challenging_level": "None recorded yet",
            "comments": []
        }

    # 1. Rating metrics
    ratings = [r["rating"] for r in records]
    avg_rating = round(sum(ratings) / total, 2)
    rating_dist = {i: ratings.count(i) for i in range(1, 6)}

    # 2. Difficulty distribution
    diff_keys = ["Easy", "Medium", "Hard", "Very Hard"]
    diff_dist = {k: 0 for k in diff_keys}
    for r in records:
        d = r.get("difficulty")
        if d in diff_dist:
            diff_dist[d] += 1
    diff_pct = {k: round((diff_dist[k] / total) * 100, 1) for k in diff_keys}

    # 3. Learning experience metrics
    learn_keys = ["Yes, definitely", "Somewhat", "Not really"]
    learn_dist = {k: 0 for k in learn_keys}
    for r in records:
        l = r.get("learning_experience")
        if l in learn_dist:
            learn_dist[l] += 1
    learn_pct = {k: round((learn_dist[k] / total) * 100, 1) for k in learn_keys}
    # Percentage who found the game useful ("Yes, definitely" + "Somewhat")
    useful_count = learn_dist["Yes, definitely"] + learn_dist["Somewhat"]
    useful_pct = round((useful_count / total) * 100, 1)

    # 4. Gameplay experience metrics
    game_keys = ["Very interesting", "Interesting", "Average", "Needs improvement"]
    game_dist = {k: 0 for k in game_keys}
    for r in records:
        g = r.get("gameplay_experience")
        if g in game_dist:
            game_dist[g] += 1
    game_pct = {k: round((game_dist[k] / total) * 100, 1) for k in game_keys}

    # 5. Most challenging level
    lvl_keys = [
        "Level 1 – Data Cleaning",
        "Level 2 – EDA and Correlation",
        "Level 3 – K-Means Clustering",
        "Level 4 – Outlier Detection",
        "Level 5 – Regression"
    ]
    lvl_dist = {k: 0 for k in lvl_keys}
    for r in records:
        cl = r.get("challenging_level")
        if cl in lvl_dist:
            lvl_dist[cl] += 1
    most_challenging = max(lvl_dist, key=lvl_dist.get) if any(lvl_dist.values()) else "Tie / Varied"

    # 6. Comments collection
    comments_list = [
        {
            "name": r["name"],
            "rating": r["rating"],
            "difficulty": r["difficulty"],
            "challenging_level": r["challenging_level"],
            "comment": r["comments"],
            "timestamp": r["timestamp"]
        }
        for r in records if r["comments"]
    ]

    return {
        "total_players": total,
        "average_rating": avg_rating,
        "rating_distribution": rating_dist,
        "difficulty_distribution": diff_dist,
        "difficulty_percentages": diff_pct,
        "learning_distribution": learn_dist,
        "learning_percentages": learn_pct,
        "learning_useful_percentage": useful_pct,
        "gameplay_distribution": game_dist,
        "gameplay_percentages": game_pct,
        "challenging_level_distribution": lvl_dist,
        "most_challenging_level": most_challenging,
        "comments": comments_list
    }

def export_feedback_csv_string():
    """Generates a structured CSV string containing all submitted feedback."""
    records = get_all_feedback()
    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Feedback ID",
        "Timestamp",
        "Player Name",
        "Overall Rating (1-5)",
        "Game Difficulty",
        "Learning Experience",
        "Gameplay Experience",
        "Most Challenging Level",
        "Suggestions and Comments"
    ])

    for r in records:
        writer.writerow([
            r["id"],
            r["timestamp"],
            r["name"],
            r["rating"],
            r["difficulty"],
            r["learning_experience"],
            r["gameplay_experience"],
            r["challenging_level"],
            r["comments"]
        ])

    return output.getvalue()
