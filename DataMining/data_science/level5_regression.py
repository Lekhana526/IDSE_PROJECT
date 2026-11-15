"""
Level 5 Data Science Engine: Supervised Regression & Model Evaluation
Trains Linear Regression, Decision Tree, and Random Forest models on ore data.
Evaluates using actual train/test split, MAE, RMSE, and R2 metrics.
"""

import os
import io
import base64
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets", "final_vault_ores.csv")

# Secret Master Vault Gem features
MASTER_GEM = {
    'Ore_Purity_Pct': 98.5,
    'Carat_Size': 32.0,
    'Extraction_Depth_m': 420.0,
    'Hardness_Mohs': 9.6
}

def train_and_evaluate(model_type='random_forest', features=None):
    """
    Trains selected regressor on train set (80%) and evaluates on test set (20%).
    Available models: 'linear', 'decision_tree', 'random_forest'.
    """
    df = pd.read_csv(DATASET_PATH)
    
    if features is None or len(features) == 0:
        features = ['Ore_Purity_Pct', 'Carat_Size', 'Extraction_Depth_m', 'Hardness_Mohs']
        
    X = df[features]
    y = df['Vault_Value_Gold']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Instantiate actual model
    if model_type == 'linear':
        model = LinearRegression()
        model_name = "Linear Regression"
    elif model_type == 'decision_tree':
        model = DecisionTreeRegressor(max_depth=5, random_state=42)
        model_name = "Decision Tree Regressor (Depth=5)"
    elif model_type == 'random_forest':
        model = RandomForestRegressor(n_estimators=50, random_state=42)
        model_name = "Random Forest Regressor (50 Trees)"
    else:
        raise ValueError(f"Unsupported model: {model_type}")
        
    # Fit model on training data
    model.fit(X_train, y_train)
    
    # Predict on test set
    y_pred = model.predict(X_test)
    
    # Actual evaluation metrics
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))
    
    # Predict Master Gem Value
    master_df = pd.DataFrame([MASTER_GEM])[features]
    vault_prediction = float(model.predict(master_df)[0])
    
    # Matplotlib actual vs predicted plot
    fig, ax = plt.subplots(figsize=(7.5, 4.5), facecolor='#161924')
    ax.set_facecolor('#0d1117')
    ax.tick_params(colors='#8bc34a', labelsize=9)
    for spine in ax.spines.values():
        spine.set_color('#30363d')
        
    ax.scatter(y_test, y_pred, color='#00e5ff', edgecolors='#ffffff', alpha=0.9, s=55, label='Test Samples')
    
    # Ideal 1:1 line
    min_val = min(y_test.min(), y_pred.min()) * 0.95
    max_val = max(y_test.max(), y_pred.max()) * 1.05
    ax.plot([min_val, max_val], [min_val, max_val], color='#ffeb3b', linestyle='--', linewidth=2, label='Perfect Prediction (y=x)')
    
    ax.set_title(f"Model Evaluation: {model_name}\nMAE: {mae:.2f} | RMSE: {rmse:.2f} | R²: {r2:.3f}",
                 color='#e6edf3', fontsize=11, fontweight='bold')
    ax.set_xlabel("Actual Vault Value (Gold Coins)", color='#8bc34a', fontsize=9.5)
    ax.set_ylabel("Predicted Value (Gold Coins)", color='#8bc34a', fontsize=9.5)
    ax.legend(facecolor='#161924', edgecolor='#30363d', labelcolor='#ffffff', fontsize=8.5)
    
    plt.tight_layout()
    
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100, facecolor=fig.get_facecolor(), edgecolor='none')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    
    # Sample predictions comparison
    comp_df = pd.DataFrame({
        'Actual_Value': y_test.values[:5].round(1),
        'Predicted_Value': y_pred[:5].round(1),
        'Absolute_Error': np.abs(y_test.values[:5] - y_pred[:5]).round(1)
    })
    
    return {
        'model_type': model_type,
        'model_name': model_name,
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'features_used': features,
        'metrics': {
            'mae': round(mae, 2),
            'rmse': round(rmse, 2),
            'r2_score': round(r2, 4)
        },
        'vault_gem_prediction': round(vault_prediction, 1),
        'predictions_preview': comp_df.to_dict(orient='records'),
        'chart_image_base64': img_base64
    }

def compare_all_models():
    """Runs all 3 regression models and returns a side-by-side leaderboard comparison."""
    models = ['linear', 'decision_tree', 'random_forest']
    comparison = []
    
    for m in models:
        res = train_and_evaluate(model_type=m)
        comparison.append({
            'model_type': m,
            'model_name': res['model_name'],
            'mae': res['metrics']['mae'],
            'rmse': res['metrics']['rmse'],
            'r2_score': res['metrics']['r2_score'],
            'vault_prediction': res['vault_gem_prediction']
        })
        
    # Sort by lowest RMSE / highest R2
    comparison.sort(key=lambda x: x['rmse'])
    best_model = comparison[0]['model_type']
    
    return {
        'leaderboard': comparison,
        'best_model': best_model,
        'recommended_prediction': comparison[0]['vault_prediction']
    }

def verify_vault_combination(chosen_model):
    """Verifies that the player chose the superior model based on test evaluation metrics."""
    comp = compare_all_models()
    best = comp['best_model']
    
    is_best = (chosen_model == best)
    
    if is_best:
        feedback = (
            f"VAULT UNLOCKED! {chosen_model.replace('_', ' ').title()} achieved the lowest RMSE "
            f"and highest R² score on unseen test data! Its generalization power provided "
            f"the exact valuation code ({comp['recommended_prediction']} gold) to unlock the Ancient Vault of Gold!"
        )
    else:
        feedback = (
            f"The vault mechanism remains locked! {chosen_model.replace('_', ' ').title()} suffered from "
            f"higher prediction error (RMSE). Examine the test set evaluation metrics and select the champion model!"
        )
        
    return {
        'success': is_best,
        'chosen_model': chosen_model,
        'best_model': best,
        'vault_code': comp['recommended_prediction'],
        'feedback': feedback
    }
