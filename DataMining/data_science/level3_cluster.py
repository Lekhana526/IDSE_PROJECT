"""
Level 3 Data Science Engine: K-Means Clustering
Uses Scikit-learn to cluster crystal samples and identify the rare crystal group.
"""

import os
import io
import base64
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets", "crystal_kingdom.csv")

def perform_clustering(k=3):
    """
    Executes actual Scikit-learn K-Means algorithm on crystal properties:
    [Refractive_Index, Hardness_Mohs, Density_g_cm3, Luminosity_Flux].
    """
    df = pd.read_csv(DATASET_PATH)
    features = ['Refractive_Index', 'Hardness_Mohs', 'Density_g_cm3', 'Luminosity_Flux']
    X = df[features]
    
    # Run Scikit-learn KMeans
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    df['Cluster'] = kmeans.fit_predict(X)
    
    centroids = kmeans.cluster_centers_
    inertia = float(kmeans.inertia_)
    
    # Cluster summary
    cluster_summaries = []
    for c_id in range(k):
        c_subset = df[df['Cluster'] == c_id]
        mean_ref = round(float(c_subset['Refractive_Index'].mean()), 3)
        mean_hard = round(float(c_subset['Hardness_Mohs'].mean()), 2)
        mean_dens = round(float(c_subset['Density_g_cm3'].mean()), 2)
        mean_lum = round(float(c_subset['Luminosity_Flux'].mean()), 1)
        count = int(len(c_subset))
        
        cluster_summaries.append({
            'cluster_id': c_id,
            'count': count,
            'mean_refractive': mean_ref,
            'mean_hardness': mean_hard,
            'mean_density': mean_dens,
            'mean_luminosity': mean_lum
        })
        
    # The rare Mythic Star Crystal cluster is the one with highest luminosity & hardness
    rare_cluster_id = max(cluster_summaries, key=lambda x: (x['mean_luminosity'] + x['mean_hardness'] * 5))['cluster_id']
    
    # Matplotlib Visualization
    fig, ax = plt.subplots(figsize=(8, 5), facecolor='#161924')
    ax.set_facecolor('#0d1117')
    ax.tick_params(colors='#8bc34a', labelsize=9)
    for spine in ax.spines.values():
        spine.set_color('#30363d')
        
    palette = ['#00e5ff', '#ffeb3b', '#e040fb', '#00e676', '#ff5722', '#7c4dff']
    
    for c_id in range(k):
        c_data = df[df['Cluster'] == c_id]
        color = palette[c_id % len(palette)]
        is_rare = (c_id == rare_cluster_id)
        label = f"Cluster {c_id}" + (" (Mythic Rare!)" if is_rare else "")
        
        ax.scatter(
            c_data['Hardness_Mohs'], 
            c_data['Luminosity_Flux'],
            c=color,
            s=50 if not is_rare else 85,
            edgecolors='#ffffff' if is_rare else 'none',
            linewidths=1.2 if is_rare else 0,
            alpha=0.85,
            label=label
        )
        
    # Plot centroids
    centroid_x = centroids[:, 1] # Hardness
    centroid_y = centroids[:, 3] # Luminosity
    ax.scatter(centroid_x, centroid_y, c='#ffffff', marker='X', s=160, edgecolors='#ff1744', linewidths=2, label='Centroids', zorder=10)
    
    ax.set_title(f"K-Means Crystal Clustering (K={k})", color='#e6edf3', fontsize=12, fontweight='bold')
    ax.set_xlabel("Hardness (Mohs Scale)", color='#8bc34a', fontsize=10)
    ax.set_ylabel("Luminosity Flux (Lumens)", color='#8bc34a', fontsize=10)
    ax.legend(facecolor='#161924', edgecolor='#30363d', labelcolor='#ffffff', fontsize=8.5, loc='upper left')
    
    plt.tight_layout()
    
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100, facecolor=fig.get_facecolor(), edgecolor='none')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    
    return {
        'k': k,
        'inertia': round(inertia, 2),
        'cluster_summaries': cluster_summaries,
        'rare_cluster_id': rare_cluster_id,
        'chart_image_base64': img_base64,
        'sample_crystals': df.sample(6, random_state=42).to_dict(orient='records')
    }

def verify_cluster_choice(k, selected_cluster_id):
    """Verifies if the player accurately recognized the rare cluster."""
    result = perform_clustering(k=k)
    rare_id = result['rare_cluster_id']
    is_correct = (int(selected_cluster_id) == int(rare_id))
    
    if is_correct:
        summary = next(c for c in result['cluster_summaries'] if c['cluster_id'] == rare_id)
        feedback = (
            f"EXCELLENT WORK! Cluster {rare_id} possesses extraordinary luminosity "
            f"({summary['mean_luminosity']} flux) and hardness ({summary['mean_hardness']} Mohs). "
            f"These are genuine Mythic Star Crystals! The gate to the Crystal Chamber swings open!"
        )
    else:
        feedback = (
            f"Cluster {selected_cluster_id} consists of common geodes or lower-grade beryls. "
            f"Cluster {rare_id} exhibited the distinct outlier cluster signature with maximal luminosity and hardness. Try again!"
        )
        
    return {
        'correct': is_correct,
        'selected_cluster': selected_cluster_id,
        'rare_cluster_id': rare_id,
        'feedback': feedback
    }
