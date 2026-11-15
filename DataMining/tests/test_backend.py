"""
Automated Test Suite for DATA MINER: THE TREASURE HUNT
Tests Data Science algorithms, datasets, and Flask API endpoints.
"""

import os
import sys
import unittest
import json

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from data_science.data_generator import generate_all_datasets
from data_science.level1_cleaner import get_raw_data, clean_data
from data_science.level2_eda import get_eda_analysis, verify_vein_choice
from data_science.level3_cluster import perform_clustering, verify_cluster_choice
from data_science.level4_outliers import detect_outliers, verify_hazard_disarm
from data_science.level5_regression import train_and_evaluate, compare_all_models, verify_vault_combination

class TestDataScienceEngines(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        generate_all_datasets()
        cls.client = app.test_client()

    # --- LEVEL 1 TESTS ---
    def test_level1_raw_inspection(self):
        raw = get_raw_data()
        self.assertGreater(raw['total_rows'], 0)
        self.assertGreater(raw['total_missing'], 0)
        self.assertIn('Weight_Carats', raw['missing_by_column'])

    def test_level1_imputation(self):
        # Test median
        res_median = clean_data(strategy='median')
        self.assertTrue(res_median['success'])
        self.assertEqual(res_median['missing_after'], 0)

        # Test mean
        res_mean = clean_data(strategy='mean')
        self.assertTrue(res_mean['success'])
        self.assertEqual(res_mean['missing_after'], 0)

        # Test drop
        res_drop = clean_data(strategy='drop')
        self.assertTrue(res_drop['success'])
        self.assertEqual(res_drop['missing_after'], 0)
        self.assertLess(res_drop['rows_remaining'], res_median['rows_remaining'])

    # --- LEVEL 2 TESTS ---
    def test_level2_eda_and_correlation(self):
        eda = get_eda_analysis()
        self.assertIn('descriptive_stats', eda)
        self.assertIn('correlations_with_value', eda)
        self.assertIn('chart_image_base64', eda)
        self.assertTrue(len(eda['chart_image_base64']) > 100)

        strongest = eda['strongest_feature']
        self.assertIsNotNone(strongest)

        # Verification
        v_correct = verify_vein_choice(strongest)
        self.assertTrue(v_correct['correct'])

        v_incorrect = verify_vein_choice('Extraction_Depth_m')
        self.assertFalse(v_incorrect['correct'])

    # --- LEVEL 3 TESTS ---
    def test_level3_kmeans(self):
        for k in [2, 3, 4]:
            res = perform_clustering(k=k)
            self.assertEqual(res['k'], k)
            self.assertEqual(len(res['cluster_summaries']), k)
            self.assertGreater(res['inertia'], 0)
            self.assertTrue(len(res['chart_image_base64']) > 100)

        res3 = perform_clustering(k=3)
        rare_id = res3['rare_cluster_id']
        v = verify_cluster_choice(3, rare_id)
        self.assertTrue(v['correct'])

    # --- LEVEL 4 TESTS ---
    def test_level4_outliers_iqr(self):
        outliers = detect_outliers()
        self.assertIn('iqr_stats', outliers)
        vibe_stats = outliers['iqr_stats']['vibration']
        self.assertGreater(vibe_stats['upper_bound'], vibe_stats['q3'])
        self.assertGreater(outliers['outlier_count'], 0)
        self.assertTrue(len(outliers['chart_image_base64']) > 100)

        # Test disarm verification
        outlier_ids = [r['Rock_ID'] for r in outliers['outlier_samples']]
        disarm_res = verify_hazard_disarm(outlier_ids)
        self.assertTrue(disarm_res['success'])

    # --- LEVEL 5 TESTS ---
    def test_level5_regression_evaluation(self):
        for m in ['linear', 'decision_tree', 'random_forest']:
            res = train_and_evaluate(model_type=m)
            self.assertIn('mae', res['metrics'])
            self.assertIn('rmse', res['metrics'])
            self.assertIn('r2_score', res['metrics'])
            self.assertGreater(res['vault_gem_prediction'], 0)
            self.assertTrue(len(res['chart_image_base64']) > 100)

        comp = compare_all_models()
        self.assertEqual(len(comp['leaderboard']), 3)
        self.assertIsNotNone(comp['best_model'])

        v = verify_vault_combination(comp['best_model'])
        self.assertTrue(v['success'])

    # --- FLASK API ROUTE TESTS ---
    def test_flask_routes(self):
        # Index
        r = self.client.get('/')
        self.assertEqual(r.status_code, 200)

        # Level 1 APIs
        r = self.client.get('/api/level1/raw')
        self.assertEqual(r.status_code, 200)
        r = self.client.post('/api/level1/clean', json={'strategy': 'median'})
        self.assertEqual(r.status_code, 200)

        # Level 2 APIs
        r = self.client.get('/api/level2/eda')
        self.assertEqual(r.status_code, 200)
        r = self.client.post('/api/level2/verify', json={'feature': 'Crystal_Size_mm'})
        self.assertEqual(r.status_code, 200)

        # Level 3 APIs
        r = self.client.get('/api/level3/cluster?k=3')
        self.assertEqual(r.status_code, 200)

        # Level 4 APIs
        r = self.client.get('/api/level4/outliers')
        self.assertEqual(r.status_code, 200)

        # Level 5 APIs
        r = self.client.get('/api/level5/compare')
        self.assertEqual(r.status_code, 200)

        # Feedback API Routes Check
        r = self.client.get('/api/feedback')
        self.assertEqual(r.status_code, 200)

        r = self.client.get('/api/feedback/summary')
        self.assertEqual(r.status_code, 200)

        r = self.client.get('/feedback-report')
        self.assertEqual(r.status_code, 200)

    # --- QUESTION SET TESTS ---
    def test_question_sets_and_apis(self):
        # 1. Test sets summary
        r = self.client.get('/api/questions/sets')
        self.assertEqual(r.status_code, 200)
        data = r.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertEqual(len(data['data']), 3)

        # Verify all 3 sets have questions
        for s in data['data']:
            self.assertIn('set_id', s)
            self.assertIn('name', s)
            self.assertEqual(s['question_count'], 5)

        # 2. Test fetching each individual set
        for sid in [1, 2, 3]:
            r = self.client.get(f'/api/questions/set/{sid}')
            self.assertEqual(r.status_code, 200)
            s_data = r.get_json()
            self.assertEqual(s_data['status'], 'success')
            q_list = s_data['data']['questions']
            self.assertEqual(len(q_list), 5)
            for q in q_list:
                self.assertIn('id', q)
                self.assertIn('level', q)
                self.assertIn('topic', q)
                self.assertIn('question', q)
                self.assertIn('type', q)
                self.assertIn('explanation', q)

        # 3. Test random question set
        r = self.client.get('/api/questions/random')
        self.assertEqual(r.status_code, 200)
        rand_data = r.get_json()
        self.assertEqual(rand_data['status'], 'success')
        self.assertIn(rand_data['data']['set_id'], [1, 2, 3])

        # 4. Test question answer verification for Set 1 (all levels)
        answers_set1 = [
            ('q1_1', 'B', True),          # MCQ
            ('q1_2', 'Hardness', True),   # Short Text
            ('q1_3', 'B', True),          # MCQ
            ('q1_4', '70', True),         # Numerical
            ('q1_5', 'C', True),          # MCQ
        ]
        for q_id, ans, expected in answers_set1:
            r_c = self.client.post('/api/questions/verify', json={
                'set_id': 1,
                'question_id': q_id,
                'chosen_option': ans
            })
            self.assertEqual(r_c.status_code, 200)
            res = r_c.get_json()
            self.assertEqual(res['is_correct'], expected)
            self.assertEqual(res['reward_points'], 50)
            self.assertIsNotNone(res['explanation'])

        # 5. Test question answer verification for Set 2
        answers_set2 = [
            ('q2_1', 'B', True),
            ('q2_2', '0.80', True),
            ('q2_3', 'C', True),
            ('q2_4', '18, 28, 10, Yes', True),
            ('q2_5', 'B', True),
        ]
        for q_id, ans, expected in answers_set2:
            r_c = self.client.post('/api/questions/verify', json={
                'set_id': 2,
                'question_id': q_id,
                'chosen_option': ans
            })
            self.assertEqual(r_c.status_code, 200)
            res = r_c.get_json()
            self.assertEqual(res['is_correct'], expected)

        # 6. Test question answer verification for Set 3
        answers_set3 = [
            ('q3_1', 'C', True),
            ('q3_2', 'B', True),
            ('q3_3', 'C3', True),
            ('q3_4', 'C', True),
            ('q3_5', 'Random Forest', True),
        ]
        for q_id, ans, expected in answers_set3:
            r_c = self.client.post('/api/questions/verify', json={
                'set_id': 3,
                'question_id': q_id,
                'chosen_option': ans
            })
            self.assertEqual(r_c.status_code, 200)
            res = r_c.get_json()
            self.assertEqual(res['is_correct'], expected)

        # 7. Incorrect answer: should NOT reveal explanation, should penalize energy
        r_incorrect = self.client.post('/api/questions/verify', json={
            'set_id': 1,
            'question_id': 'q1_1',
            'chosen_option': 'A'
        })
        self.assertEqual(r_incorrect.status_code, 200)
        res_inc = r_incorrect.get_json()
        self.assertFalse(res_inc['is_correct'])
        self.assertIsNone(res_inc['explanation'])  # Do NOT reveal answer!
        self.assertEqual(res_inc['penalty_energy'], 12)

    # --- DYNAMIC QUESTION COMPUTATION TESTS ---
    def test_dynamic_question_solvers(self):
        from data_science.question_bank import QuestionSolvers

        # 1. Test q1_1: dynamic median computation on [10, 12, 14, None, 18, 100]
        res1_1 = QuestionSolvers.solve_q1_1()
        self.assertEqual(res1_1["computed_value"], 14.0)
        self.assertEqual(res1_1["correct_answer"], "B")
        self.assertIn("14", res1_1["explanation"])

        # 2. Test q1_2: dynamic correlation minimum (strongest negative)
        res1_2 = QuestionSolvers.solve_q1_2()
        self.assertEqual(res1_2["correct_answer"], "Hardness")
        self.assertEqual(res1_2["computed_value"], -0.18)

        # 3. Test q1_4: dynamic IQR upper boundary calculation: 40 + 1.5 * (40 - 20) = 70
        res1_4 = QuestionSolvers.solve_q1_4(q1=20.0, q3=40.0, multiplier=1.5)
        self.assertEqual(res1_4["computed_value"], 70.0)

        # 4. Test q2_2: dynamic Pearson formula calculation: 320 / (4 * 100) = 0.80
        res2_2 = QuestionSolvers.solve_q2_2(cov=320.0, std_x=4.0, std_y=100.0)
        self.assertEqual(res2_2["computed_value"], 0.80)

        # 5. Test q2_4: dynamic multi-part median of halves & outlier fence
        res2_4 = QuestionSolvers.solve_q2_4()
        cv2_4 = res2_4["computed_value"]
        self.assertEqual(cv2_4["q1"], 18.0)
        self.assertEqual(cv2_4["q3"], 28.0)
        self.assertEqual(cv2_4["iqr"], 10.0)
        self.assertEqual(cv2_4["upper_bound"], 43.0)
        self.assertTrue(cv2_4["is_outlier"])
        self.assertEqual(res2_4["correct_answer"], "18, 28, 10, Yes")

        # 6. Test q3_3: dynamic Euclidean distance to nearest centroid
        res3_3 = QuestionSolvers.solve_q3_3()
        self.assertEqual(res3_3["correct_answer"], "C3")
        self.assertAlmostEqual(res3_3["computed_value"]["C3"], 1.414, places=2)
        self.assertAlmostEqual(res3_3["computed_value"]["C1"], 4.0, places=2)

        # 7. Test q3_5: dynamic lowest RMSE model selection
        res3_5 = QuestionSolvers.solve_q3_5()
        self.assertEqual(res3_5["correct_answer"], "Random Forest")
        self.assertEqual(res3_5["computed_value"], 11)

    def test_dynamic_solvers_with_different_inputs(self):
        """Verifies that changing input data dynamically alters the calculated outcomes."""
        from data_science.question_bank import QuestionSolvers

        # Different dataset for q1_1: [5, 15, 25, None, 45, 95] -> median = 25
        res_custom_median = QuestionSolvers.solve_q1_1(data=[5, 15, 25, None, 45, 95])
        self.assertEqual(res_custom_median["computed_value"], 25.0)

        # Different correlations for q1_2: Density is now the strongest negative
        custom_corrs = {"Weight": 0.5, "Hardness": -0.1, "Size": 0.3, "Density": -0.85}
        res_custom_corrs = QuestionSolvers.solve_q1_2(corrs=custom_corrs)
        self.assertEqual(res_custom_corrs["correct_answer"], "Density")
        self.assertEqual(res_custom_corrs["computed_value"], -0.85)

        # Different IQR parameters for q1_4: Q1=50, Q3=100 -> IQR=50 -> Upper=100 + 1.5*50 = 175
        res_custom_iqr = QuestionSolvers.solve_q1_4(q1=50.0, q3=100.0, multiplier=1.5)
        self.assertEqual(res_custom_iqr["computed_value"], 175.0)

        # Different covariance and standard deviations for q2_2: Cov=150, sx=5, sy=50 -> r = 150/250 = 0.60
        res_custom_pearson = QuestionSolvers.solve_q2_2(cov=150.0, std_x=5.0, std_y=50.0)
        self.assertEqual(res_custom_pearson["computed_value"], 0.60)

        # Different point for centroid distance in q3_3: point (1, 3) should be closest to C1 (2, 3)
        res_custom_centroid = QuestionSolvers.solve_q3_3(target_point=(1, 3))
        self.assertEqual(res_custom_centroid["correct_answer"], "C1")

    # --- PLAYER FEEDBACK SYSTEM TESTS ---
    def test_player_feedback_system(self):
        # 1. Validation test: missing required fields
        r_bad = self.client.post('/api/feedback', json={
            'name': 'Incomplete Cadet'
        })
        self.assertEqual(r_bad.status_code, 400)
        data_bad = r_bad.get_json()
        self.assertEqual(data_bad['status'], 'error')

        # 2. Submit Player 1 Feedback (Cadet Alice)
        alice_data = {
            'name': 'Cadet Alice',
            'rating': 5,
            'difficulty': 'Medium',
            'learning_experience': 'Yes, definitely',
            'gameplay_experience': 'Very interesting',
            'challenging_level': 'Level 3 – K-Means Clustering',
            'comments': 'Loved exploring the clusters with K-Means!'
        }
        r_p1 = self.client.post('/api/feedback', json=alice_data)
        self.assertEqual(r_p1.status_code, 200)
        res1 = r_p1.get_json()
        self.assertEqual(res1['status'], 'success')
        self.assertIn('THANK YOU', res1['message'])

        # 3. Submit Player 2 Feedback (Cadet Bob)
        bob_data = {
            'name': 'Cadet Bob',
            'rating': 4,
            'difficulty': 'Hard',
            'learning_experience': 'Somewhat',
            'gameplay_experience': 'Interesting',
            'challenging_level': 'Level 4 – Outlier Detection',
            'comments': 'IQR hazard disarm was exciting.'
        }
        r_p2 = self.client.post('/api/feedback', json=bob_data)
        self.assertEqual(r_p2.status_code, 200)
        res2 = r_p2.get_json()
        self.assertEqual(res2['status'], 'success')

        # 4. Verify both responses are preserved in SQLite database
        r_all = self.client.get('/api/feedback')
        self.assertEqual(r_all.status_code, 200)
        records = r_all.get_json()['feedback']
        self.assertGreaterEqual(len(records), 2)
        names = [r['name'] for r in records]
        self.assertIn('Cadet Alice', names)
        self.assertIn('Cadet Bob', names)

        # 5. Verify statistical summary calculates genuine outcomes
        r_summary = self.client.get('/api/feedback/summary')
        self.assertEqual(r_summary.status_code, 200)
        s = r_summary.get_json()['data']
        self.assertGreaterEqual(s['total_players'], 2)
        self.assertGreater(s['average_rating'], 0)
        self.assertIn(s['most_challenging_level'], [
            'Level 1 – Data Cleaning',
            'Level 2 – EDA and Correlation',
            'Level 3 – K-Means Clustering',
            'Level 4 – Outlier Detection',
            'Level 5 – Regression'
        ])
        self.assertGreaterEqual(s['learning_useful_percentage'], 50.0)

        # 6. Verify CSV export
        r_export = self.client.get('/api/feedback/export')
        self.assertEqual(r_export.status_code, 200)
        self.assertEqual(r_export.mimetype, 'text/csv')
        csv_text = r_export.data.decode('utf-8')
        self.assertIn('Feedback ID', csv_text)
        self.assertIn('Cadet Alice', csv_text)
        self.assertIn('Cadet Bob', csv_text)

        # 7. Verify Developer HTML report page loads
        r_report = self.client.get('/feedback-report')
        self.assertEqual(r_report.status_code, 200)
        self.assertIn(b'DATA MINER // PEER-TESTING REPORT', r_report.data)

        # 8. Clean up test records to avoid polluting live feedback database
        from data_science.feedback_manager import get_db_connection
        conn = get_db_connection()
        try:
            conn.execute("DELETE FROM player_feedback WHERE name IN ('Cadet Alice', 'Cadet Bob')")
            conn.commit()
        finally:
            conn.close()

if __name__ == '__main__':
    unittest.main()
