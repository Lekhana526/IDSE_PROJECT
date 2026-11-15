"""
Level 2 Data Science Engine: Exploratory Data Analysis & Correlation
Uses Pandas, NumPy, and Matplotlib to analyze mineral features and correlations.
"""

import os
import io
import base64
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg') # Headless backend for server
import matplotlib.pyplot as plt

DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets", "cave_samples_eda.csv")

def get_eda_analysis(selected_feature=None):
    """Computes descriptive statistics and correlations for mineral samples."""
    df = pd.read_csv(DATASET_PATH)
    numeric_df = df[['Weight_Carats', 'Hardness_Mohs', 'Crystal_Size_mm', 'Extraction_Depth_m', 'Market_Value_Coins']]
    
    # 1. Descriptive statistics
    desc = numeric_df.describe().round(2).to_dict()
    
    # 2. Pearson correlation matrix
    corr_matrix = numeric_df.corr().round(3).to_dict()
    
    # Correlations specifically with Market_Value_Coins
    value_corr = numeric_df.corr()['Market_Value_Coins'].drop('Market_Value_Coins').round(3).to_dict()
    
    # Find strongest positive feature
    strongest_feature = max(value_corr.items(), key=lambda x: x[1])[0]
    
    # Active feature for inspection (defaults to strongest if none provided)
    active_feature = selected_feature if (selected_feature in value_corr) else strongest_feature
    active_corr = value_corr[active_feature]
    
    if active_corr >= 0.6:
        rel_type = "Strong Positive Correlation"
        rel_desc = f"As {active_feature.replace('_', ' ')} increases, Market Value strongly increases (r = {active_corr:+.2f}). This feature is an excellent predictor!"
    elif active_corr > 0.15:
        rel_type = "Moderate Positive Correlation"
        rel_desc = f"As {active_feature.replace('_', ' ')} increases, Market Value moderately increases (r = {active_corr:+.2f})."
    elif active_corr >= -0.15:
        rel_type = "Weak / Negligible Correlation"
        rel_desc = f"Changes in {active_feature.replace('_', ' ')} show virtually no linear association with Market Value (r = {active_corr:+.2f})."
    else:
        rel_type = "Negative Correlation"
        rel_desc = f"As {active_feature.replace('_', ' ')} increases, Market Value tends to decrease (r = {active_corr:+.2f}). An inverse relationship!"
    
    # 3. Generate Matplotlib visualization (Scatter Plot of Active Feature vs Market Value)
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.5), facecolor='#161924')
    
    # Style styling for dark pixel-art cave theme
    for ax in (ax1, ax2):
        ax.set_facecolor('#0d1117')
        ax.tick_params(colors='#8bc34a', labelsize=9)
        for spine in ax.spines.values():
            spine.set_color('#30363d')
            
    # Subplot 1: Correlation Bar Chart
    features = list(value_corr.keys())
    values = [value_corr[f] for f in features]
    clean_labels = [f.replace('_', ' ') for f in features]
    colors = ['#00e676' if f == active_feature else ('#4caf50' if v > 0.6 else '#ff9800' if v > 0 else '#f44336') for f, v in zip(features, values)]
    
    bars = ax1.barh(clean_labels, values, color=colors, edgecolor='#8bc34a', alpha=0.85)
    ax1.set_xlim(-0.25, 1.05)
    ax1.set_title("Pearson Correlation with Market Value", color='#e6edf3', fontsize=11, fontweight='bold')
    ax1.set_xlabel("Pearson Correlation (r)", color='#8bc34a', fontsize=9)
    ax1.axvline(0, color='#888', linestyle='--', linewidth=0.8)
    
    # Add values on bars
    for bar in bars:
        w = bar.get_width()
        ax1.text(w + (0.02 if w >= 0 else -0.06), bar.get_y() + bar.get_height()/2, f"{w:+.2f}",
                 va='center', color='#ffffff', fontsize=9, fontweight='bold')
                 
    # Subplot 2: Scatter plot of active feature vs Market Value
    x = df[active_feature]
    y = df['Market_Value_Coins']
    ax2.scatter(x, y, color='#00e5ff', edgecolors='#ffffff', alpha=0.85, s=45)
    
    # Trend line (Ordinary Least Squares)
    z = np.polyfit(x, y, 1)
    p = np.poly1d(z)
    x_line = np.linspace(x.min(), x.max(), 100)
    ax2.plot(x_line, p(x_line), color='#ffeb3b', linestyle='--', linewidth=2, label=f'OLS Trend (r={active_corr:+.2f})')
    
    ax2.set_title(f"{active_feature.replace('_', ' ')} vs Value", color='#e6edf3', fontsize=11, fontweight='bold')
    ax2.set_xlabel(active_feature.replace('_', ' '), color='#8bc34a', fontsize=9)
    ax2.set_ylabel("Market Value (Coins)", color='#8bc34a', fontsize=9)
    ax2.legend(facecolor='#161924', edgecolor='#30363d', labelcolor='#ffffff', fontsize=8)
    
    plt.tight_layout()
    
    # Export to base64 PNG
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100, facecolor=fig.get_facecolor(), edgecolor='none')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    
    return {
        'descriptive_stats': desc,
        'correlation_matrix': corr_matrix,
        'correlations_with_value': value_corr,
        'strongest_feature': strongest_feature,
        'strongest_corr_value': value_corr[strongest_feature],
        'active_feature': active_feature,
        'active_corr_value': active_corr,
        'relationship_type': rel_type,
        'relationship_description': rel_desc,
        'chart_image_base64': img_base64,
        'sample_preview': df.head(5).to_dict(orient='records')
    }

def verify_vein_choice(selected_feature):
    """Verifies whether the player selected the feature with strongest correlation to uncover the hidden vein."""
    analysis = get_eda_analysis()
    strongest = analysis['strongest_feature']
    
    is_correct = (selected_feature.lower() == strongest.lower())
    
    if is_correct:
        feedback = (
            f"CORRECT! {strongest.replace('_', ' ')} has the highest Pearson correlation "
            f"(r = {analysis['strongest_corr_value']}) with mineral value! "
            f"Following veins rich in {strongest.replace('_', ' ')} reveals the secret royal treasure room!"
        )
    else:
        feedback = (
            f"INCORRECT! Selected feature '{selected_feature.replace('_', ' ')}' only has r = {analysis['correlations_with_value'].get(selected_feature, 0.0)}. "
            f"The scanner shows {strongest.replace('_', ' ')} has a much stronger correlation (r = {analysis['strongest_corr_value']})!"
        )
        
    return {
        'correct': is_correct,
        'selected_feature': selected_feature,
        'best_feature': strongest,
        'feedback': feedback
    }
