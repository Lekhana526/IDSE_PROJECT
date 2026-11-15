"""
Level 4 Data Science Engine: Outlier Detection using Interquartile Range (IQR)
Uses NumPy, Pandas, and Matplotlib to calculate Q1, Q3, IQR, and bounds.
"""

import os
import io
import base64
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets", "dangerous_mine_rocks.csv")

def detect_outliers(multiplier=1.5):
    """
    Computes IQR and identifies outliers on 'Seismic_Vibration_Hz' and 'Weight_kg'.
    Formula:
      IQR = Q3 - Q1
      Lower Bound = Q1 - multiplier * IQR
      Upper Bound = Q3 + multiplier * IQR
    """
    df = pd.read_csv(DATASET_PATH)
    
    # Calculate IQR on Seismic_Vibration_Hz
    vibe = df['Seismic_Vibration_Hz']
    q1_vibe = float(vibe.quantile(0.25))
    q3_vibe = float(vibe.quantile(0.75))
    iqr_vibe = q3_vibe - q1_vibe
    lower_vibe = q1_vibe - (multiplier * iqr_vibe)
    upper_vibe = q3_vibe + (multiplier * iqr_vibe)
    
    # Calculate IQR on Weight_kg
    weight = df['Weight_kg']
    q1_wt = float(weight.quantile(0.25))
    q3_wt = float(weight.quantile(0.75))
    iqr_wt = q3_wt - q1_wt
    lower_wt = q1_wt - (multiplier * iqr_wt)
    upper_wt = q3_wt + (multiplier * iqr_wt)
    
    # Flag outliers
    df['Vibe_Outlier'] = (vibe < lower_vibe) | (vibe > upper_vibe)
    df['Weight_Outlier'] = (weight < lower_wt) | (weight > upper_wt)
    df['Is_Outlier'] = df['Vibe_Outlier'] | df['Weight_Outlier']
    
    outlier_df = df[df['Is_Outlier']].copy()
    normal_df = df[~df['Is_Outlier']].copy()
    
    # Generate Matplotlib Box Plot and Scatter Plot
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.5), facecolor='#161924')
    for ax in (ax1, ax2):
        ax.set_facecolor('#0d1117')
        ax.tick_params(colors='#8bc34a', labelsize=9)
        for spine in ax.spines.values():
            spine.set_color('#30363d')
            
    # Subplot 1: Box Plot
    box = ax1.boxplot(df['Seismic_Vibration_Hz'], orientation='vertical', patch_artist=True,
                      boxprops=dict(facecolor='#1e88e5', color='#ffffff'),
                      capprops=dict(color='#8bc34a'),
                      whiskerprops=dict(color='#8bc34a'),
                      flierprops=dict(marker='o', markerfacecolor='#ff1744', markersize=8, markeredgecolor='#ffffff'),
                      medianprops=dict(color='#ffeb3b', linewidth=2))
    ax1.set_title("Outlier Detection (IQR Box Plot)", color='#e6edf3', fontsize=11, fontweight='bold')
    ax1.set_ylabel("Measurement Value", color='#8bc34a', fontsize=9)
    ax1.set_xticklabels(["Data Samples"], color='#e6edf3')
    
    # Annotate bounds on Box plot
    ax1.axhline(upper_vibe, color='#ff5252', linestyle='--', linewidth=1, label=f"Upper Boundary: {upper_vibe:.1f}")
    ax1.axhline(lower_vibe, color='#ff5252', linestyle='--', linewidth=1, label=f"Lower Boundary: {lower_vibe:.1f}")
    ax1.legend(facecolor='#161924', edgecolor='#30363d', labelcolor='#ffffff', fontsize=8)
    
    # Subplot 2: Scatter plot of Feature Distribution
    ax2.scatter(normal_df['Weight_kg'], normal_df['Seismic_Vibration_Hz'],
                c='#00e676', alpha=0.75, s=40, label='Normal Data')
    ax2.scatter(outlier_df['Weight_kg'], outlier_df['Seismic_Vibration_Hz'],
                c='#ff1744', edgecolors='#ffffff', alpha=0.95, s=75, marker='D', label='Statistical Outlier')
    
    ax2.axhline(upper_vibe, color='#ff5252', linestyle=':', alpha=0.7)
    ax2.axvline(upper_wt, color='#ff5252', linestyle=':', alpha=0.7)
    ax2.set_title("Outlier Distribution (Scatter Plot)", color='#e6edf3', fontsize=11, fontweight='bold')
    ax2.set_xlabel("Feature X (Weight)", color='#8bc34a', fontsize=9)
    ax2.set_ylabel("Feature Y (Measurement)", color='#8bc34a', fontsize=9)
    ax2.legend(facecolor='#161924', edgecolor='#30363d', labelcolor='#ffffff', fontsize=8)
    
    plt.tight_layout()
    
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100, facecolor=fig.get_facecolor(), edgecolor='none')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    
    return {
        'multiplier': multiplier,
        'iqr_stats': {
            'vibration': {
                'q1': round(q1_vibe, 2),
                'q3': round(q3_vibe, 2),
                'iqr': round(iqr_vibe, 2),
                'lower_bound': round(lower_vibe, 2),
                'upper_bound': round(upper_vibe, 2)
            },
            'weight': {
                'q1': round(q1_wt, 2),
                'q3': round(q3_wt, 2),
                'iqr': round(iqr_wt, 2),
                'lower_bound': round(lower_wt, 2),
                'upper_bound': round(upper_wt, 2)
            }
        },
        'total_samples': len(df),
        'outlier_count': int(df['Is_Outlier'].sum()),
        'outlier_samples': outlier_df[['Rock_ID', 'Weight_kg', 'Seismic_Vibration_Hz', 'Purity_Score', 'Secret_Type']].to_dict(orient='records'),
        'chart_image_base64': img_base64
    }

def verify_hazard_disarm(selected_rock_ids):
    """
    Verifies that the player properly targeted outliers to disarm explosive hazards
    and harvest the rare diamond.
    """
    analysis = detect_outliers()
    outlier_ids = set([r['Rock_ID'] for r in analysis['outlier_samples']])
    
    user_set = set(selected_rock_ids)
    intersection = user_set.intersection(outlier_ids)
    
    # If player correctly identified the majority or all outliers
    success = (len(intersection) >= 3)
    
    if success:
        feedback = (
            f"OUTLIER DETECTION SUCCESS! You correctly identified anomalous rocks using IQR filtering! "
            f"The explosive nitrogem rocks were neutralized before detonating, and the priceless "
            f"Celestial Diamond was successfully extracted!"
        )
    else:
        feedback = (
            f"WARNING: Normal stable rocks were misclassified or critical vibration anomalies were missed! "
            f"Values beyond Q1 - 1.5*IQR or Q3 + 1.5*IQR signify physical instability."
        )
        
    return {
        'success': success,
        'identified_count': len(intersection),
        'total_outliers': len(outlier_ids),
        'feedback': feedback
    }
