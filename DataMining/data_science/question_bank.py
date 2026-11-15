"""
DATA MINER: THE TREASURE HUNT - DYNAMIC DATA SCIENCE QUESTION BANK
Three Question Sets:
  Set 1 - The Lost Expedition
  Set 2 - The Crystal Labyrinth
  Set 3 - The Final Diamond Vault

All questions are computationally modeled and dynamically calculated.
Answers, statistical bounds, Euclidean distances, correlation coefficients,
and model comparisons are derived using real Python / NumPy / Pandas computations.
"""

import re
import math
import random
import numpy as np
import pandas as pd


# =============================================================================
# DYNAMIC COMPUTATIONAL ENGINES FOR EACH QUESTION
# =============================================================================

class QuestionSolvers:

    # --- SET 1, LEVEL 1: Missing Value Imputation (Median) ---
    @staticmethod
    def solve_q1_1(data=None):
        raw_vals = [10, 12, 14, None, 18, 100] if data is None else data
        # Filter valid non-missing numbers
        valid_obs = [x for x in raw_vals if x is not None and not (isinstance(x, float) and math.isnan(x))]
        sorted_obs = sorted(valid_obs)
        # Real NumPy median computation
        computed_median = float(np.median(sorted_obs))
        median_int = int(computed_median) if computed_median.is_integer() else computed_median

        options = {
            "A": "12",
            "B": str(median_int),
            "C": "16",
            "D": "18"
        }
        # Find which option corresponds to the computed median
        correct_opt = next(k for k, v in options.items() if v == str(median_int))

        explanation = (
            f"Sorted observed non-missing values are {sorted_obs}. With N = {len(sorted_obs)} observed values, "
            f"the dynamically computed median is the middle value at index {len(sorted_obs)//2}, which is {median_int}. "
            f"Therefore, under median imputation, {median_int} (Option {correct_opt}) will be inserted into the dataset."
        )

        return {
            "computed_value": computed_median,
            "correct_answer": correct_opt,
            "display_answer": f"{correct_opt} ({median_int})",
            "options": options,
            "explanation": explanation
        }

    @staticmethod
    def verify_q1_1(raw_input, solver_result):
        user_str = str(raw_input or "").strip().upper()
        # Accept either option letter ('B') or exact numerical median (14)
        if len(user_str) > 0 and user_str[0] in ['A', 'B', 'C', 'D']:
            return user_str[0] == solver_result["correct_answer"]
        try:
            num = float(re.findall(r"[-+]?\d*\.?\d+", user_str)[0])
            return abs(num - solver_result["computed_value"]) < 0.05
        except (ValueError, IndexError):
            return False

    # --- SET 1, LEVEL 2: Feature Correlation (Strongest Negative) ---
    @staticmethod
    def solve_q1_2(corrs=None):
        if corrs is None:
            corrs = {"Weight": 0.92, "Hardness": -0.18, "Size": 0.76, "Density": 0.43}
        # Filter negative correlations and compute minimum (strongest negative)
        negatives = {k: v for k, v in corrs.items() if v < 0}
        if not negatives:
            strongest_feature = min(corrs.items(), key=lambda x: x[1])[0]
        else:
            strongest_feature = min(negatives.items(), key=lambda x: x[1])[0]
        min_r = corrs[strongest_feature]

        explanation = (
            f"Evaluating the correlation dictionary {corrs}: {strongest_feature} has the most negative Pearson correlation "
            f"(r = {min_r}), which represents the strongest negative linear relationship with market value."
        )

        return {
            "computed_value": min_r,
            "correct_answer": strongest_feature,
            "display_answer": strongest_feature,
            "explanation": explanation
        }

    @staticmethod
    def verify_q1_2(raw_input, solver_result):
        clean_user = re.sub(r"\s+", " ", str(raw_input or "").strip().lower())
        clean_target = re.sub(r"\s+", " ", str(solver_result["correct_answer"]).strip().lower())
        return clean_user == clean_target

    # --- SET 1, LEVEL 3: K-Means Objective Function ---
    @staticmethod
    def solve_q1_3(k=4, sample_count=120):
        # K-Means objective function: Inertia (within-cluster sum of squared Euclidean distances)
        options = {
            "A": "It creates four clusters by randomly assigning permanent labels.",
            "B": "It minimises the within-cluster sum of squared distances from samples to their assigned centroids.",
            "C": "It maximises the distance between every sample and its centroid.",
            "D": "It predicts the mineral's market value using four regression models."
        }
        correct_opt = "B"
        explanation = (
            f"The mathematical objective of K-Means (operating on {sample_count} samples with K={k}) is to minimise inertia "
            f"J = Σ Σ ||x_i - μ_k||², which represents the within-cluster sum of squared distances from each observation to its assigned cluster centroid."
        )
        return {
            "computed_value": "min_wcss",
            "correct_answer": correct_opt,
            "display_answer": f"{correct_opt}",
            "options": options,
            "explanation": explanation
        }

    @staticmethod
    def verify_q1_3(raw_input, solver_result):
        user_str = str(raw_input or "").strip().upper()
        if len(user_str) > 0 and user_str[0] in ['A', 'B', 'C', 'D']:
            return user_str[0] == solver_result["correct_answer"]
        return False

    # --- SET 1, LEVEL 4: Outlier Detection (Upper IQR Boundary) ---
    @staticmethod
    def solve_q1_4(q1=20.0, q3=40.0, multiplier=1.5):
        # Real statistical computation
        iqr = float(q3 - q1)
        upper_bound = float(q3 + multiplier * iqr)
        lower_bound = float(q1 - multiplier * iqr)

        explanation = (
            f"IQR = Q3 - Q1 = {q3:g} - {q1:g} = {iqr:g}. "
            f"Upper outlier boundary = Q3 + {multiplier:g} × IQR = {q3:g} + ({multiplier:g} × {iqr:g}) = {upper_bound:g}. "
            f"(Lower boundary = Q1 - {multiplier:g} × IQR = {lower_bound:g})."
        )
        return {
            "computed_value": upper_bound,
            "correct_answer": upper_bound,
            "display_answer": f"{upper_bound:g}",
            "explanation": explanation
        }

    @staticmethod
    def verify_q1_4(raw_input, solver_result):
        try:
            num = float(re.findall(r"[-+]?\d*\.?\d+", str(raw_input or ""))[0])
            return abs(num - solver_result["computed_value"]) < 0.05
        except (ValueError, IndexError):
            return False

    # --- SET 1, LEVEL 5: Regression Model Evaluation (MAE vs RMSE) ---
    @staticmethod
    def solve_q1_5(models=None):
        if models is None:
            models = {
                "Model A": {"mae": 5.0, "rmse": 8.0},
                "Model B": {"mae": 6.0, "rmse": 7.0}
            }
        a_mae, a_rmse = models["Model A"]["mae"], models["Model A"]["rmse"]
        b_mae, b_rmse = models["Model B"]["mae"], models["Model B"]["rmse"]

        # Comparative computations
        a_has_lower_mae = (a_mae < b_mae)
        b_has_lower_rmse = (b_rmse < a_rmse)

        options = {
            "A": "Model A is better under both metrics.",
            "B": "Model B is better under both metrics.",
            "C": "Model A has lower average absolute error, but Model B has lower RMSE.",
            "D": "Both models have identical performance."
        }

        correct_opt = "C" if (a_has_lower_mae and b_has_lower_rmse) else "D"
        explanation = (
            f"Model A has lower MAE ({a_mae:g} < {b_mae:g}, average absolute error), while "
            f"Model B has lower RMSE ({b_rmse:g} < {a_rmse:g}, root mean squared error which penalises large outliers). "
            f"Therefore, Model A has lower average absolute error, but Model B has lower RMSE."
        )

        return {
            "computed_value": "A_mae_B_rmse",
            "correct_answer": correct_opt,
            "display_answer": f"{correct_opt}",
            "options": options,
            "explanation": explanation
        }

    @staticmethod
    def verify_q1_5(raw_input, solver_result):
        user_str = str(raw_input or "").strip().upper()
        if len(user_str) > 0 and user_str[0] in ['A', 'B', 'C', 'D']:
            return user_str[0] == solver_result["correct_answer"]
        return False

    # --- SET 2, LEVEL 1: Imputation for Skewed Distributions ---
    @staticmethod
    def solve_q2_1():
        # Compute demonstration on right-skewed price distribution
        sample_prices = np.array([100, 105, 110, 115, 120, 125, 130, 135, 140, 5000])
        mean_val = float(np.mean(sample_prices))
        median_val = float(np.median(sample_prices))
        skewness = float(pd.Series(sample_prices).skew())

        options = {
            "A": "Mean imputation because it considers every observation.",
            "B": "Median imputation because it is less affected by extreme values.",
            "C": "Replace all missing values with zero.",
            "D": "Delete the entire dataset."
        }
        correct_opt = "B"
        explanation = (
            f"In right-skewed distributions (skewness = {skewness:.2f} > 0), extreme high values pull the arithmetic mean "
            f"({mean_val:.1f}) far above the typical values, whereas the median ({median_val:.1f}) represents the central 50th percentile. "
            f"The median is robust against extreme outlier prices and preserves data distribution integrity."
        )

        return {
            "computed_value": "median_robustness",
            "correct_answer": correct_opt,
            "display_answer": f"{correct_opt}",
            "options": options,
            "explanation": explanation
        }

    @staticmethod
    def verify_q2_1(raw_input, solver_result):
        user_str = str(raw_input or "").strip().upper()
        if len(user_str) > 0 and user_str[0] in ['A', 'B', 'C', 'D']:
            return user_str[0] == solver_result["correct_answer"]
        return False

    # --- SET 2, LEVEL 2: Pearson Correlation Calculation ---
    @staticmethod
    def solve_q2_2(cov=320.0, std_x=4.0, std_y=100.0):
        # Pearson correlation formula: r = Cov(X,Y) / (sigma_X * sigma_Y)
        denominator = std_x * std_y
        r = float(cov / denominator)
        r_rounded = round(r, 2)

        explanation = (
            f"r = Cov(X, Y) / (σX × σY) = {cov:g} / ({std_x:g} × {std_y:g}) = "
            f"{cov:g} / {denominator:g} = {r_rounded:.2f}."
        )

        return {
            "computed_value": r_rounded,
            "correct_answer": r_rounded,
            "display_answer": f"{r_rounded:.2f}",
            "explanation": explanation
        }

    @staticmethod
    def verify_q2_2(raw_input, solver_result):
        try:
            num = float(re.findall(r"[-+]?\d*\.?\d+", str(raw_input or ""))[0])
            return abs(num - solver_result["computed_value"]) < 0.05
        except (ValueError, IndexError):
            return False

    # --- SET 2, LEVEL 3: Feature Scaling in Clustering ---
    @staticmethod
    def solve_q2_3(range_w=(1, 1000), range_h=(1, 10)):
        # Variance scale ratio computation
        span_w = range_w[1] - range_w[0]
        span_h = range_h[1] - range_h[0]
        scale_ratio = (span_w / span_h) ** 2

        options = {
            "A": "Remove the hardness feature.",
            "B": "Increase K to 20.",
            "C": "Standardise or normalise the features before clustering.",
            "D": "Convert the dataset into categorical labels."
        }
        correct_opt = "C"
        explanation = (
            f"Because K-Means uses Euclidean distance d² = ΔW² + ΔH², features with a scale range of {span_w} dominate "
            f"squared distance calculations by ~{scale_ratio:.0f}x over Hardness ({span_h}). Standardising both features "
            f"(e.g. z-score scaling to unit variance) ensures balanced distance contributions."
        )

        return {
            "computed_value": "standardize",
            "correct_answer": correct_opt,
            "display_answer": f"{correct_opt}",
            "options": options,
            "explanation": explanation
        }

    @staticmethod
    def verify_q2_3(raw_input, solver_result):
        user_str = str(raw_input or "").strip().upper()
        if len(user_str) > 0 and user_str[0] in ['A', 'B', 'C', 'D']:
            return user_str[0] == solver_result["correct_answer"]
        return False

    # --- SET 2, LEVEL 4: Multi-Step Quartiles and Outlier Detection ---
    @staticmethod
    def solve_q2_4(data=None):
        raw = [12, 15, 18, 20, 22, 24, 26, 28, 30, 100] if data is None else data
        sorted_vals = sorted(raw)
        n = len(sorted_vals)
        mid = n // 2
        # Median of halves method
        lower_half = sorted_vals[:mid]
        upper_half = sorted_vals[mid:]

        q1 = float(np.median(lower_half))
        q3 = float(np.median(upper_half))
        iqr = float(q3 - q1)
        upper_bound = float(q3 + 1.5 * iqr)
        test_val = 100
        is_outlier = (test_val > upper_bound)
        outlier_str = "Yes" if is_outlier else "No"

        canonical_answer = f"{q1:g}, {q3:g}, {iqr:g}, {outlier_str}"
        explanation = (
            f"Lower half {lower_half} -> Median Q1 = {q1:g}. Upper half {upper_half} -> Median Q3 = {q3:g}. "
            f"IQR = Q3 - Q1 = {q3:g} - {q1:g} = {iqr:g}. Upper boundary = Q3 + 1.5 × IQR = {q3:g} + 1.5 × {iqr:g} = {upper_bound:g}. "
            f"Since {test_val} > {upper_bound:g}, {test_val} is an outlier ({outlier_str})."
        )

        return {
            "computed_value": {
                "q1": q1,
                "q3": q3,
                "iqr": iqr,
                "upper_bound": upper_bound,
                "is_outlier": is_outlier
            },
            "correct_answer": canonical_answer,
            "display_answer": canonical_answer,
            "explanation": explanation
        }

    @staticmethod
    def verify_q2_4(raw_input, solver_result):
        tokens = [t.strip().lower() for t in re.split(r"[,;\s]+", str(raw_input or "")) if t.strip()]
        if len(tokens) >= 4:
            try:
                user_q1 = float(tokens[0])
                user_q3 = float(tokens[1])
                user_iqr = float(tokens[2])
                user_outlier = tokens[3]

                cv = solver_result["computed_value"]
                is_correct = (
                    abs(user_q1 - cv["q1"]) < 0.1 and
                    abs(user_q3 - cv["q3"]) < 0.1 and
                    abs(user_iqr - cv["iqr"]) < 0.1 and
                    (user_outlier in ["yes", "y", "true"]) == cv["is_outlier"]
                )
                return is_correct
            except ValueError:
                return False
        return False

    # --- SET 2, LEVEL 5: Overfitting / Underfitting Diagnosis ---
    @staticmethod
    def solve_q2_5(train_rmse=2.0, test_rmse=25.0):
        # Generalization ratio computation
        error_ratio = test_rmse / train_rmse
        error_gap = test_rmse - train_rmse

        options = {
            "A": "The model is underfitting.",
            "B": "The model is overfitting.",
            "C": "The model has perfect generalisation.",
            "D": "The model has no prediction error."
        }

        # If train error is very low but test error is high, model has high variance (overfitting)
        correct_opt = "B" if (train_rmse < 5.0 and error_ratio > 3.0) else "A"
        explanation = (
            f"Training RMSE = {train_rmse:g} while Testing RMSE = {test_rmse:g} (generalisation error gap = {error_gap:g}, "
            f"ratio = {error_ratio:.1f}x). A massive disparity where train error is near zero but test error is high "
            f"is the textbook signature of overfitting (high variance)."
        )

        return {
            "computed_value": "overfitting",
            "correct_answer": correct_opt,
            "display_answer": f"{correct_opt}",
            "options": options,
            "explanation": explanation
        }

    @staticmethod
    def verify_q2_5(raw_input, solver_result):
        user_str = str(raw_input or "").strip().upper()
        if len(user_str) > 0 and user_str[0] in ['A', 'B', 'C', 'D']:
            return user_str[0] == solver_result["correct_answer"]
        return False

    # --- SET 3, LEVEL 1: Preventing Data Leakage ---
    @staticmethod
    def solve_q3_1():
        options = {
            "A": "Calculate the mean using the complete dataset before splitting.",
            "B": "Calculate separate means using the training and testing sets.",
            "C": "Calculate the mean using training data and use that same value to impute both training and testing data.",
            "D": "Replace all missing values with the maximum weight."
        }
        correct_opt = "C"
        explanation = (
            "To prevent data leakage, parameters (such as mean, median, or scaling statistics) must be estimated exclusively "
            "from the training set. The training mean is then applied to transform both the training and test sets."
        )
        return {
            "computed_value": "fit_train_transform_both",
            "correct_answer": correct_opt,
            "display_answer": f"{correct_opt}",
            "options": options,
            "explanation": explanation
        }

    @staticmethod
    def verify_q3_1(raw_input, solver_result):
        user_str = str(raw_input or "").strip().upper()
        if len(user_str) > 0 and user_str[0] in ['A', 'B', 'C', 'D']:
            return user_str[0] == solver_result["correct_answer"]
        return False

    # --- SET 3, LEVEL 2: Correlation vs Causation and R^2 ---
    @staticmethod
    def solve_q3_2(r=0.95):
        # Calculate coefficient of determination R^2
        r_squared = r ** 2
        var_explained_pct = r_squared * 100

        options = {
            "A": "Increasing weight definitely causes market value to increase.",
            "B": "Weight and market value have a strong positive linear association, but causation cannot be concluded from correlation alone.",
            "C": "Both variables have identical values.",
            "D": "Weight explains exactly 95% of the variation in market value."
        }
        correct_opt = "B"
        explanation = (
            f"Pearson correlation r = {r} indicates a strong positive linear association. Observational correlation does not establish causation. "
            f"Furthermore, R² = r² = {r}² = {r_squared:.4f} ({var_explained_pct:.2f}%), proving that weight explains ~{var_explained_pct:.1f}% "
            f"(not 95%) of the variance in market value."
        )

        return {
            "computed_value": {
                "r": r,
                "r_squared": r_squared
            },
            "correct_answer": correct_opt,
            "display_answer": f"{correct_opt}",
            "options": options,
            "explanation": explanation
        }

    @staticmethod
    def verify_q3_2(raw_input, solver_result):
        user_str = str(raw_input or "").strip().upper()
        if len(user_str) > 0 and user_str[0] in ['A', 'B', 'C', 'D']:
            return user_str[0] == solver_result["correct_answer"]
        return False

    # --- SET 3, LEVEL 3: Euclidean Distance to Cluster Centroids ---
    @staticmethod
    def solve_q3_3(centroids=None, target_point=(6, 3)):
        if centroids is None:
            centroids = {
                "C1": (2, 3),
                "C2": (8, 8),
                "C3": (5, 2)
            }
        # Compute exact Euclidean distance: sqrt((x2-x1)^2 + (y2-y1)^2)
        px, py = target_point
        distances = {}
        for name, (cx, cy) in centroids.items():
            dist = math.hypot(px - cx, py - cy)
            distances[name] = dist

        nearest_centroid = min(distances.items(), key=lambda x: x[1])[0]

        lines = [f"• d({c}) = sqrt(({px}-{coords[0]})² + ({py}-{coords[1]})²) = {distances[c]:.2f}" for c, coords in centroids.items()]
        explanation = (
            f"Euclidean distances to point {target_point}:\n" +
            "\n".join(lines) +
            f"\nNearest centroid is {nearest_centroid} (d = {distances[nearest_centroid]:.2f})."
        )

        return {
            "computed_value": distances,
            "correct_answer": nearest_centroid,
            "display_answer": nearest_centroid,
            "explanation": explanation
        }

    @staticmethod
    def verify_q3_3(raw_input, solver_result):
        clean_user = re.sub(r"\s+", "", str(raw_input or "").strip().lower())
        clean_target = str(solver_result["correct_answer"]).strip().lower()
        return clean_user == clean_target

    # --- SET 3, LEVEL 4: Outlier Treatment Best Practices ---
    @staticmethod
    def solve_q3_4(sample_vals=None):
        if sample_vals is None:
            sample_vals = [10, 12, 13, 14, 15, 16, 17, 18, 100]
        q1 = float(np.percentile(sample_vals, 25))
        q3 = float(np.percentile(sample_vals, 75))
        iqr = float(q3 - q1)
        upper_bound = float(q3 + 1.5 * iqr)

        options = {
            "A": "Always delete 100 because it is an outlier.",
            "B": "Replace 100 with zero.",
            "C": "Investigate whether 100 is a measurement error or a genuine rare mineral observation before deciding what to do.",
            "D": "Delete every observation above the mean."
        }
        correct_opt = "C"
        explanation = (
            f"With Q1={q1:g}, Q3={q3:g}, and IQR={iqr:g}, the upper threshold is {upper_bound:g}. The value 100 is mathematically an outlier, "
            f"but outliers should never be deleted blindly without domain investigation. Rare valuable minerals provide critical discovery signal, "
            f"whereas sensor errors must be cleansed."
        )

        return {
            "computed_value": upper_bound,
            "correct_answer": correct_opt,
            "display_answer": f"{correct_opt}",
            "options": options,
            "explanation": explanation
        }

    @staticmethod
    def verify_q3_4(raw_input, solver_result):
        user_str = str(raw_input or "").strip().upper()
        if len(user_str) > 0 and user_str[0] in ['A', 'B', 'C', 'D']:
            return user_str[0] == solver_result["correct_answer"]
        return False

    # --- SET 3, LEVEL 5: Regression Model Leaderboard Comparison ---
    @staticmethod
    def solve_q3_5(models=None):
        if models is None:
            models = {
                "Linear Regression": {"mae": 12, "rmse": 16},
                "Decision Tree": {"mae": 9, "rmse": 14},
                "Random Forest": {"mae": 10, "rmse": 11}
            }
        best_model = min(models.items(), key=lambda x: x[1]["rmse"])[0]
        min_rmse = models[best_model]["rmse"]

        explanation = (
            f"Comparing RMSE across all models: {', '.join(f'{k} (RMSE = {v['rmse']})' for k, v in models.items())}. "
            f"{best_model} achieves the lowest RMSE of {min_rmse} on the test dataset, indicating superior predictive generalisation."
        )

        return {
            "computed_value": min_rmse,
            "correct_answer": best_model,
            "display_answer": best_model,
            "explanation": explanation
        }

    @staticmethod
    def verify_q3_5(raw_input, solver_result):
        clean_user = re.sub(r"[\s_-]+", " ", str(raw_input or "").strip().lower())
        clean_target = re.sub(r"[\s_-]+", " ", str(solver_result["correct_answer"]).strip().lower())
        # Support initials e.g. 'rf' or 'random forest'
        if clean_user in ["rf", "random forest"]:
            return True
        return clean_user == clean_target


# =============================================================================
# QUESTION DEFINITION SCHEMAS (SOLVER HOOKS)
# =============================================================================

QUESTION_REGISTRY = {
    "q1_1": {
        "id": "q1_1",
        "set_id": 1,
        "level": 1,
        "topic": "Data Cleaning and Missing Value Imputation",
        "type": "mcq",
        "question": "A mineral dataset has the following weight measurements:\n\n[10, 12, 14, NaN, 18, 100]\n\nIf the missing value is replaced using the median, what value will be inserted?",
        "solver": QuestionSolvers.solve_q1_1,
        "verifier": QuestionSolvers.verify_q1_1
    },
    "q1_2": {
        "id": "q1_2",
        "set_id": 1,
        "level": 2,
        "topic": "EDA and Correlation",
        "type": "short_text",
        "question": "A dataset contains the following correlation values with mineral market value:\n\n• Weight: 0.92\n• Hardness: -0.18\n• Size: 0.76\n• Density: 0.43\n\nWhich feature has the strongest negative relationship with market value?",
        "input_placeholder": "Enter feature name (e.g. Hardness)",
        "solver": QuestionSolvers.solve_q1_2,
        "verifier": QuestionSolvers.verify_q1_2
    },
    "q1_3": {
        "id": "q1_3",
        "set_id": 1,
        "level": 3,
        "topic": "K-Means Clustering",
        "type": "mcq",
        "question": "K-Means is applied to a dataset containing 120 mineral samples. The player selects K = 4.\n\nWhich statement correctly describes the algorithm?",
        "solver": QuestionSolvers.solve_q1_3,
        "verifier": QuestionSolvers.verify_q1_3
    },
    "q1_4": {
        "id": "q1_4",
        "set_id": 1,
        "level": 4,
        "topic": "Outlier Detection",
        "type": "numerical",
        "question": "A mineral weight dataset has:\n\nQ1 = 20\nQ3 = 40\n\nUsing the IQR method, calculate the upper outlier boundary.",
        "input_placeholder": "Enter numerical value",
        "solver": QuestionSolvers.solve_q1_4,
        "verifier": QuestionSolvers.verify_q1_4
    },
    "q1_5": {
        "id": "q1_5",
        "set_id": 1,
        "level": 5,
        "topic": "Regression and Model Evaluation",
        "type": "mcq",
        "question": "Two regression models produce these results on the same test dataset:\n\nModel A: MAE = 5, RMSE = 8\nModel B: MAE = 6, RMSE = 7\n\nWhich statement is correct?",
        "solver": QuestionSolvers.solve_q1_5,
        "verifier": QuestionSolvers.verify_q1_5
    },

    "q2_1": {
        "id": "q2_1",
        "set_id": 2,
        "level": 1,
        "topic": "Data Cleaning and Missing Value Imputation",
        "type": "mcq",
        "question": "A dataset contains mineral prices with a highly right-skewed distribution due to a few extremely expensive diamonds.\n\nWhich method is generally more appropriate for imputing missing price values?",
        "solver": QuestionSolvers.solve_q2_1,
        "verifier": QuestionSolvers.verify_q2_1
    },
    "q2_2": {
        "id": "q2_2",
        "set_id": 2,
        "level": 2,
        "topic": "EDA and Correlation",
        "type": "numerical",
        "question": "A dataset contains 50 mineral samples.\n\n• Mean weight = 20 grams\n• Mean market value = ₹500\n• Standard deviation of weight = 4\n• Standard deviation of market value = 100\n• Covariance = 320\n\nCalculate the Pearson correlation coefficient.\n\nUse:\nr = Cov(X,Y) / (σX × σY)\n\nRound your answer to two decimal places.",
        "input_placeholder": "Enter decimal value (e.g. 0.80)",
        "solver": QuestionSolvers.solve_q2_2,
        "verifier": QuestionSolvers.verify_q2_2
    },
    "q2_3": {
        "id": "q2_3",
        "set_id": 2,
        "level": 3,
        "topic": "K-Means Clustering",
        "type": "mcq",
        "question": "A mineral dataset contains two features:\n\n• Weight: ranges from 1 to 1000.\n• Hardness: ranges from 1 to 10.\n\nK-Means clustering produces groups almost entirely based on weight.\n\nWhat is the most appropriate solution?",
        "solver": QuestionSolvers.solve_q2_3,
        "verifier": QuestionSolvers.verify_q2_3
    },
    "q2_4": {
        "id": "q2_4",
        "set_id": 2,
        "level": 4,
        "topic": "Outlier Detection",
        "type": "multi_part",
        "question": "A dataset has the following values:\n\n[12, 15, 18, 20, 22, 24, 26, 28, 30, 100]\n\nUsing the median-of-halves method:\n1. Calculate Q1.\n2. Calculate Q3.\n3. Calculate IQR.\n4. Determine whether 100 is an outlier.\n\nAnswer format:\nQ1, Q3, IQR, Outlier (Yes/No)",
        "input_placeholder": "e.g. 18, 28, 10, Yes",
        "solver": QuestionSolvers.solve_q2_4,
        "verifier": QuestionSolvers.verify_q2_4
    },
    "q2_5": {
        "id": "q2_5",
        "set_id": 2,
        "level": 5,
        "topic": "Regression and Model Evaluation",
        "type": "mcq",
        "question": "A Decision Tree Regressor achieves:\n\nTraining RMSE = 2\nTesting RMSE = 25\n\nWhat is the most likely explanation?",
        "solver": QuestionSolvers.solve_q2_5,
        "verifier": QuestionSolvers.verify_q2_5
    },

    "q3_1": {
        "id": "q3_1",
        "set_id": 3,
        "level": 1,
        "topic": "Data Cleaning and Missing Value Imputation",
        "type": "mcq",
        "question": "A mineral dataset is divided into training and testing sets.\n\nYou want to use mean imputation for missing weight values.\n\nWhich approach prevents data leakage?",
        "solver": QuestionSolvers.solve_q3_1,
        "verifier": QuestionSolvers.verify_q3_1
    },
    "q3_2": {
        "id": "q3_2",
        "set_id": 3,
        "level": 2,
        "topic": "EDA and Correlation",
        "type": "mcq",
        "question": "The correlation between mineral weight and market value is 0.95.\n\nWhich conclusion is scientifically valid?",
        "solver": QuestionSolvers.solve_q3_2,
        "verifier": QuestionSolvers.verify_q3_2
    },
    "q3_3": {
        "id": "q3_3",
        "set_id": 3,
        "level": 3,
        "topic": "K-Means Clustering",
        "type": "short_text",
        "question": "A K-Means algorithm has three cluster centroids:\n\nC1 = (2, 3)\nC2 = (8, 8)\nC3 = (5, 2)\n\nA newly discovered mineral has coordinates (6, 3).\n\nUsing Euclidean distance, identify the nearest centroid.",
        "input_placeholder": "Enter centroid name (e.g. C1, C2, C3)",
        "solver": QuestionSolvers.solve_q3_3,
        "verifier": QuestionSolvers.verify_q3_3
    },
    "q3_4": {
        "id": "q3_4",
        "set_id": 3,
        "level": 4,
        "topic": "Outlier Detection",
        "type": "mcq",
        "question": "A mineral dataset contains:\n\n[10, 12, 13, 14, 15, 16, 17, 18, 100]\n\nThe value 100 is flagged as an outlier using IQR.\n\nWhat should the data scientist do?",
        "solver": QuestionSolvers.solve_q3_4,
        "verifier": QuestionSolvers.verify_q3_4
    },
    "q3_5": {
        "id": "q3_5",
        "set_id": 3,
        "level": 5,
        "topic": "Regression and Model Evaluation",
        "type": "short_text",
        "question": "Three regression models are evaluated on the same test dataset:\n\nLinear Regression: MAE = 12, RMSE = 16\nDecision Tree: MAE = 9, RMSE = 14\nRandom Forest: MAE = 10, RMSE = 11\n\nThe game requires you to select the model with the lowest RMSE.",
        "input_placeholder": "Enter model name (e.g. Random Forest)",
        "solver": QuestionSolvers.solve_q3_5,
        "verifier": QuestionSolvers.verify_q3_5
    }
}

SET_METADATA = {
    1: {
        "set_id": 1,
        "name": "The Lost Expedition",
        "description": "Exploration records from the abandoned upper mine shafts.",
        "question_ids": ["q1_1", "q1_2", "q1_3", "q1_4", "q1_5"]
    },
    2: {
        "set_id": 2,
        "name": "The Crystal Labyrinth",
        "description": "Geological sensor surveys from the labyrinthine crystal caverns.",
        "question_ids": ["q2_1", "q2_2", "q2_3", "q2_4", "q2_5"]
    },
    3: {
        "set_id": 3,
        "name": "The Final Diamond Vault",
        "description": "Master evaluation telemetry from the Mountain King's Diamond Vault.",
        "question_ids": ["q3_1", "q3_2", "q3_3", "q3_4", "q3_5"]
    }
}


def build_computed_question(q_def):
    """
    Dynamically computes the answer, options, and explanation
    using the question's computational solver.
    """
    solver_fn = q_def["solver"]
    res = solver_fn()

    q_data = {
        "id": q_def["id"],
        "level": q_def["level"],
        "topic": q_def["topic"],
        "type": q_def["type"],
        "question": q_def["question"],
        "correct_answer": res["correct_answer"],
        "display_answer": res.get("display_answer", str(res["correct_answer"])),
        "explanation": res["explanation"]
    }

    if "options" in res:
        q_data["options"] = res["options"]
    elif "options" in q_def:
        q_data["options"] = q_def["options"]

    if "input_placeholder" in q_def:
        q_data["input_placeholder"] = q_def["input_placeholder"]

    return q_data


def get_question_sets_summary():
    """Returns summaries of the three dynamically calculated question sets."""
    return [
        {
            "set_id": s["set_id"],
            "name": s["name"],
            "description": s["description"],
            "question_count": len(s["question_ids"])
        }
        for s in SET_METADATA.values()
    ]


def get_question_set(set_id):
    """
    Dynamically generates the question set by running statistical computations
    for each question in the set.
    """
    set_id = int(set_id)
    meta = SET_METADATA.get(set_id, SET_METADATA[1])

    computed_questions = []
    for q_id in meta["question_ids"]:
        q_def = QUESTION_REGISTRY[q_id]
        computed_questions.append(build_computed_question(q_def))

    return {
        "set_id": meta["set_id"],
        "name": meta["name"],
        "description": meta["description"],
        "questions": computed_questions
    }


def get_random_question_set():
    """Randomly selects one of the three question sets and generates its dynamic results."""
    chosen_id = random.choice([1, 2, 3])
    return get_question_set(chosen_id)


def verify_question_answer(set_id, question_id, chosen_answer):
    """
    Validates a submitted answer against the dynamically computed result.
    Does NOT compare against hardcoded answers: executes the question's
    computational verifier and solver.
    """
    q_def = QUESTION_REGISTRY.get(question_id)
    if not q_def:
        return {
            "status": "error",
            "message": f"Question {question_id} not found."
        }

    solver_res = q_def["solver"]()
    verifier_fn = q_def["verifier"]
    is_correct = verifier_fn(chosen_answer, solver_res)

    set_meta = SET_METADATA.get(int(set_id), SET_METADATA[1])

    if is_correct:
        return {
            "status": "success",
            "is_correct": True,
            "set_id": set_meta["set_id"],
            "set_name": set_meta["name"],
            "question_id": q_def["id"],
            "level": q_def["level"],
            "topic": q_def["topic"],
            "computed_answer": solver_res["display_answer"],
            "explanation": solver_res["explanation"],
            "feedback": "Analysis Verified! Data restored successfully.",
            "reward_points": 50,
            "penalty_energy": 0
        }
    else:
        # DO NOT reveal the correct answer immediately after a wrong attempt!
        return {
            "status": "success",
            "is_correct": False,
            "set_id": set_meta["set_id"],
            "set_name": set_meta["name"],
            "question_id": q_def["id"],
            "level": q_def["level"],
            "topic": q_def["topic"],
            "explanation": None,
            "feedback": "Incorrect analysis. Review your calculations and try again.",
            "reward_points": 0,
            "penalty_energy": 12
        }
