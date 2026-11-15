"""
DATA MINER: THE TREASURE HUNT - FLASK BACKEND SERVER
Interactive 2D Adventure Game for Learning Data Science with Python
"""

import os
import json
import math
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory, Response
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS

from data_science.level1_cleaner import get_raw_data, clean_data
from data_science.level2_eda import get_eda_analysis, verify_vein_choice
from data_science.level3_cluster import perform_clustering, verify_cluster_choice
from data_science.level4_outliers import detect_outliers, verify_hazard_disarm
from data_science.level5_regression import train_and_evaluate, compare_all_models, verify_vault_combination
from data_science.question_bank import (
    get_question_sets_summary,
    get_question_set,
    get_random_question_set,
    verify_question_answer
)
from data_science.feedback_manager import (
    save_feedback,
    get_all_feedback,
    get_public_reviews,
    get_feedback_summary,
    export_feedback_csv_string
)

app = Flask(__name__, static_folder='static', template_folder='templates')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True

def sanitize_for_json(obj):
    """Recursively replace NaN/Inf float values with None for valid JSON."""
    if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
        return None
    elif isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [sanitize_for_json(v) for v in obj]
    return obj

class SafeJSONProvider(DefaultJSONProvider):
    def dumps(self, obj, **kwargs):
        return super().dumps(sanitize_for_json(obj), **kwargs)

app.json = SafeJSONProvider(app)

CORS(app)

FEEDBACK_FILE = os.path.join(app.static_folder, 'feedback', 'feedback.json')
os.makedirs(os.path.dirname(FEEDBACK_FILE), exist_ok=True)
if not os.path.exists(FEEDBACK_FILE):
    with open(FEEDBACK_FILE, 'w') as f:
        json.dump([], f)

# ----------------- PAGE ROUTES ----------------- #

@app.route('/')
def index():
    return render_template('index.html')

# ----------------- LEVEL 1 APIS ----------------- #

@app.route('/api/level1/raw', methods=['GET'])
def api_level1_raw():
    try:
        data = get_raw_data()
        return jsonify(sanitize_for_json({'status': 'success', 'data': data}))
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/level1/clean', methods=['POST'])
def api_level1_clean():
    try:
        req = request.get_json() or {}
        strategy = req.get('strategy', 'median')
        result = clean_data(strategy=strategy)
        return jsonify(sanitize_for_json({'status': 'success', 'result': result}))
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ----------------- LEVEL 2 APIS ----------------- #

@app.route('/api/level2/eda', methods=['GET'])
def api_level2_eda():
    try:
        feature = request.args.get('feature', None)
        data = get_eda_analysis(selected_feature=feature)
        return jsonify({'status': 'success', 'data': data})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/level2/verify', methods=['POST'])
def api_level2_verify():
    try:
        req = request.get_json() or {}
        feature = req.get('feature', '')
        result = verify_vein_choice(feature)
        return jsonify({'status': 'success', 'result': result})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ----------------- LEVEL 3 APIS ----------------- #

@app.route('/api/level3/cluster', methods=['GET', 'POST'])
def api_level3_cluster():
    try:
        req = request.get_json() if request.is_json else {}
        k = int(request.args.get('k', req.get('k', 3)))
        data = perform_clustering(k=k)
        return jsonify({'status': 'success', 'data': data})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/level3/verify', methods=['POST'])
def api_level3_verify():
    try:
        req = request.get_json() or {}
        k = int(req.get('k', 3))
        cluster_id = int(req.get('cluster_id', 0))
        result = verify_cluster_choice(k, cluster_id)
        return jsonify({'status': 'success', 'result': result})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ----------------- LEVEL 4 APIS ----------------- #

@app.route('/api/level4/outliers', methods=['GET', 'POST'])
def api_level4_outliers():
    try:
        req = request.get_json() if request.is_json else {}
        multiplier = float(request.args.get('multiplier', req.get('multiplier', 1.5)))
        data = detect_outliers(multiplier=multiplier)
        return jsonify({'status': 'success', 'data': data})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/level4/disarm', methods=['POST'])
def api_level4_disarm():
    try:
        req = request.get_json() or {}
        rock_ids = req.get('rock_ids', [])
        result = verify_hazard_disarm(rock_ids)
        return jsonify({'status': 'success', 'result': result})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ----------------- LEVEL 5 APIS ----------------- #

@app.route('/api/level5/train', methods=['POST'])
def api_level5_train():
    try:
        req = request.get_json() or {}
        model_type = req.get('model_type', 'random_forest')
        result = train_and_evaluate(model_type=model_type)
        return jsonify({'status': 'success', 'result': result})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/level5/compare', methods=['GET'])
def api_level5_compare():
    try:
        data = compare_all_models()
        return jsonify({'status': 'success', 'data': data})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/level5/verify', methods=['POST'])
def api_level5_verify():
    try:
        req = request.get_json() or {}
        chosen_model = req.get('chosen_model', '')
        result = verify_vault_combination(chosen_model)
        return jsonify({'status': 'success', 'result': result})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ----------------- QUESTION SETS APIS ----------------- #

@app.route('/api/questions/sets', methods=['GET'])
def api_question_sets():
    try:
        data = get_question_sets_summary()
        return jsonify({'status': 'success', 'data': data})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/questions/set/<int:set_id>', methods=['GET'])
def api_question_set(set_id):
    try:
        data = get_question_set(set_id)
        return jsonify({'status': 'success', 'data': data})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/questions/random', methods=['GET'])
def api_question_random():
    try:
        data = get_random_question_set()
        return jsonify({'status': 'success', 'data': data})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/questions/verify', methods=['POST'])
def api_question_verify():
    try:
        req = request.get_json() or {}
        set_id = int(req.get('set_id', 1))
        question_id = req.get('question_id', '')
        chosen_option = req.get('chosen_option', '')
        result = verify_question_answer(set_id, question_id, chosen_option)
        return jsonify(result)
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ----------------- PLAYTEST PEER FEEDBACK APIS ----------------- #

@app.route('/api/feedback', methods=['GET', 'POST'])
def api_feedback():
    if request.method == 'POST':
        try:
            req = request.get_json() or {}
            result = save_feedback(req)
            if result.get("status") == "error":
                return jsonify(result), 400
            return jsonify(result)
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500
    else:
        try:
            page = request.args.get('page', 1)
            per_page = request.args.get('per_page', 8)
            data = get_public_reviews(page=page, per_page=per_page)
            data['feedback'] = data.get('reviews', [])
            return jsonify(data)
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/feedback/public', methods=['GET'])
def api_feedback_public():
    try:
        page = request.args.get('page', 1)
        per_page = request.args.get('per_page', 8)
        data = get_public_reviews(page=page, per_page=per_page)
        return jsonify(data)
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/feedback/summary', methods=['GET'])
def api_feedback_summary():
    try:
        summary = get_feedback_summary()
        return jsonify({'status': 'success', 'data': summary})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/feedback/export', methods=['GET'])
def api_feedback_export():
    try:
        csv_data = export_feedback_csv_string()
        filename = f"data_miner_peer_feedback_{datetime.now().strftime('%Y%m%d')}.csv"
        return Response(
            csv_data,
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/feedback-report')
def feedback_report_page():
    try:
        summary = get_feedback_summary()
        records = get_all_feedback()
        return render_template('feedback_report.html', summary=summary, records=records)
    except Exception as e:
        return f"Error loading report: {e}", 500

if __name__ == '__main__':
    print("Starting Data Miner: The Treasure Hunt server on http://localhost:5000 and http://127.0.0.1:5000 ...")
    app.run(host='0.0.0.0', port=5000, debug=False)
