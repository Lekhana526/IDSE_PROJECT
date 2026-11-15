"""
Data Miner: The Treasure Hunt - Synthetic Dataset Generator
Generates realistic mineral datasets with physical properties, noise,
missing values, and statistical distributions for all 5 levels.
"""

import os
import numpy as np
import pandas as pd

DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets")

def ensure_dirs():
    os.makedirs(DATASET_DIR, exist_ok=True)

def generate_level1_data():
    """
    Level 1: The Missing Minerals
    Generates mineral records with missing values (NaN) in Weight, Hardness, and Value.
    Contains Ruby, Emerald, Diamond, Sapphire, Amethyst, Topaz, Quartz.
    """
    np.random.seed(42)
    minerals = ['Ruby', 'Emerald', 'Diamond', 'Sapphire', 'Amethyst', 'Topaz', 'Quartz', 'Opal', 'Garnet', 'Beryl']
    
    # Base physical properties (Mohs hardness, typical carats/weight, base value)
    base_props = {
        'Ruby': (9.0, 12.5, 650),
        'Emerald': (7.8, 10.2, 550),
        'Diamond': (10.0, 6.5, 1200),
        'Sapphire': (9.0, 11.0, 600),
        'Amethyst': (7.0, 18.0, 180),
        'Topaz': (8.0, 14.0, 320),
        'Quartz': (7.0, 22.0, 90),
        'Opal': (6.0, 8.5, 380),
        'Garnet': (7.5, 15.0, 240),
        'Beryl': (7.8, 13.0, 410)
    }
    
    rows = []
    sample_id = 101
    for i in range(40):
        m = np.random.choice(minerals)
        base_h, base_w, base_v = base_props[m]
        
        # Add realistic noise
        weight = round(float(np.random.normal(base_w, 2.0)), 2)
        hardness = round(float(np.clip(np.random.normal(base_h, 0.4), 1.0, 10.0)), 1)
        value = round(float(max(50.0, np.random.normal(base_v, 80.0))), 2)
        clarity_rating = np.random.choice(['VVS1', 'VS1', 'SI1', 'I1'], p=[0.15, 0.35, 0.35, 0.15])
        
        rows.append({
            'Sample_ID': f"MIN-{sample_id}",
            'Mineral': m,
            'Weight_Carats': weight,
            'Hardness_Mohs': hardness,
            'Clarity': clarity_rating,
            'Estimated_Value_Coins': value
        })
        sample_id += 1
        
    df = pd.DataFrame(rows)
    
    # Intentionally inject missing values in ~15-20% of records
    np.random.seed(101)
    mask_weight = np.random.rand(len(df)) < 0.18
    mask_hardness = np.random.rand(len(df)) < 0.15
    mask_value = np.random.rand(len(df)) < 0.20
    
    df.loc[mask_weight, 'Weight_Carats'] = np.nan
    df.loc[mask_hardness, 'Hardness_Mohs'] = np.nan
    df.loc[mask_value, 'Estimated_Value_Coins'] = np.nan
    
    out_path = os.path.join(DATASET_DIR, "minerals_exploration.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated Level 1 dataset: {out_path} ({len(df)} rows, {df.isna().sum().sum()} missing values)")
    return out_path

def generate_level2_data():
    """
    Level 2: The Hidden Treasure (EDA & Correlation)
    Dataset of mineral samples with features: Weight, Hardness, Crystal_Size, Extraction_Depth, Market_Value.
    Feature with strongest positive correlation to Market_Value is Crystal_Size or Hardness.
    """
    np.random.seed(84)
    n = 60
    
    # Weight: 5 to 50 carats
    weight = np.random.uniform(5, 50, n)
    # Hardness: 5 to 10 Mohs
    hardness = np.random.uniform(5.5, 9.8, n)
    # Crystal_Size (mm): strongly correlates with value
    crystal_size = 2.5 * weight**0.5 + np.random.normal(0, 1.2, n)
    # Extraction_Depth (meters): weak/negative correlation
    depth = np.random.uniform(50, 450, n)
    
    # Market_Value (Coins): strong relationship with Crystal_Size and Hardness
    market_value = (
        15.0 * crystal_size**1.8 + 
        30.0 * hardness**1.3 + 
        1.5 * weight + 
        np.random.normal(0, 25, n)
    )
    market_value = np.clip(market_value, 50, 2000).round(1)
    
    df = pd.DataFrame({
        'Sample_ID': [f"CR-{200+i}" for i in range(n)],
        'Weight_Carats': weight.round(2),
        'Hardness_Mohs': hardness.round(2),
        'Crystal_Size_mm': crystal_size.round(2),
        'Extraction_Depth_m': depth.round(1),
        'Market_Value_Coins': market_value
    })
    
    out_path = os.path.join(DATASET_DIR, "cave_samples_eda.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated Level 2 dataset: {out_path} ({len(df)} rows)")
    return out_path

def generate_level3_data():
    """
    Level 3: The Crystal Kingdom (K-Means Clustering)
    Hundreds of crystals across 3 distinct natural geological clusters:
    - Cluster 0: Common Geodes (low hardness, low refractive index, high density)
    - Cluster 1: Prismatic Beryls (medium hardness, medium refractive index, medium density)
    - Cluster 2: Mythic Star Crystals (RARE: ultra-high hardness, high refractive index, high luminescence)
    """
    np.random.seed(1337)
    
    # 3 clusters with different sample counts
    # Cluster 0: 60 Common Geodes
    c0_refractive = np.random.normal(1.54, 0.03, 60)
    c0_hardness = np.random.normal(6.5, 0.4, 60)
    c0_density = np.random.normal(2.65, 0.1, 60)
    c0_luminance = np.random.normal(15.0, 4.0, 60)
    
    # Cluster 1: 50 Prismatic Beryls
    c1_refractive = np.random.normal(1.77, 0.03, 50)
    c1_hardness = np.random.normal(8.0, 0.35, 50)
    c1_density = np.random.normal(3.55, 0.15, 50)
    c1_luminance = np.random.normal(45.0, 6.0, 50)
    
    # Cluster 2: 25 Mythic Star Crystals (RARE)
    c2_refractive = np.random.normal(2.42, 0.04, 25)
    c2_hardness = np.random.normal(9.8, 0.2, 25)
    c2_density = np.random.normal(4.20, 0.12, 25)
    c2_luminance = np.random.normal(92.0, 5.0, 25)
    
    refractive = np.concatenate([c0_refractive, c1_refractive, c2_refractive])
    hardness = np.clip(np.concatenate([c0_hardness, c1_hardness, c2_hardness]), 1.0, 10.0)
    density = np.concatenate([c0_density, c1_density, c2_density])
    luminance = np.clip(np.concatenate([c0_luminance, c1_luminance, c2_luminance]), 0, 100)
    
    # Shuffle
    indices = np.random.permutation(len(refractive))
    
    df = pd.DataFrame({
        'Crystal_ID': [f"CRYSTAL-{300+i}" for i in range(len(indices))],
        'Refractive_Index': refractive[indices].round(3),
        'Hardness_Mohs': hardness[indices].round(2),
        'Density_g_cm3': density[indices].round(2),
        'Luminosity_Flux': luminance[indices].round(1)
    })
    
    out_path = os.path.join(DATASET_DIR, "crystal_kingdom.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated Level 3 dataset: {out_path} ({len(df)} rows)")
    return out_path

def generate_level4_data():
    """
    Level 4: The Dangerous Mine (Outlier Detection with IQR)
    75 rock samples from an unstable chamber.
    Most rocks have standard seismic vibration and density measurements.
    There are a few explosive unstable anomaly rocks (high vibration/weight)
    and one ultra-pure Legendary Star Diamond (massive anomaly in purity).
    """
    np.random.seed(999)
    n_normal = 65
    
    # Normal rocks
    norm_weight = np.random.normal(45.0, 6.0, n_normal)
    norm_vibration = np.random.normal(24.0, 4.0, n_normal)
    norm_purity = np.random.normal(35.0, 5.0, n_normal)
    
    # Outliers (Explosive Unstable Volatile Rocks: high vibration & abnormal weight)
    out_weight_unstable = np.array([88.5, 94.2, 98.0, 105.4, 12.0])
    out_vibe_unstable = np.array([78.0, 85.5, 92.0, 89.0, 68.0])
    out_purity_unstable = np.array([12.0, 15.0, 8.0, 10.5, 9.0])
    
    # Outlier (Rare Celestial Diamond: high purity, low vibration)
    out_weight_diamond = np.array([51.0, 48.0])
    out_vibe_diamond = np.array([8.0, 7.5])
    out_purity_diamond = np.array([96.5, 99.2])
    
    weights = np.concatenate([norm_weight, out_weight_unstable, out_weight_diamond])
    vibrations = np.concatenate([norm_vibration, out_vibe_unstable, out_vibe_diamond])
    purities = np.concatenate([norm_purity, out_purity_unstable, out_purity_diamond])
    
    rock_types = ['Standard Granitic Rock'] * n_normal + \
                 ['Volatile Nitrogem (Explosive Hazard!)'] * len(out_weight_unstable) + \
                 ['Pure Celestial Diamond (Priceless Treasure!)'] * len(out_weight_diamond)
    
    perm = np.random.permutation(len(weights))
    
    df = pd.DataFrame({
        'Rock_ID': [f"RCK-{400+i}" for i in range(len(perm))],
        'Weight_kg': weights[perm].round(2),
        'Seismic_Vibration_Hz': vibrations[perm].round(2),
        'Purity_Score': purities[perm].round(1),
        'Secret_Type': np.array(rock_types)[perm]
    })
    
    out_path = os.path.join(DATASET_DIR, "dangerous_mine_rocks.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated Level 4 dataset: {out_path} ({len(df)} rows)")
    return out_path

def generate_level5_data():
    """
    Level 5: The Final Treasure (Regression & Model Evaluation)
    120 ore samples for vault valuation.
    Features: Ore_Purity (%), Carat_Size, Extraction_Depth (m), Hardness_Mohs.
    Target: Vault_Value_Gold.
    Contains non-linear and interaction effects so Decision Tree / Random Forest
    compete with Linear Regression, demonstrating true model evaluation (MAE/RMSE).
    """
    np.random.seed(2024)
    n = 120
    
    purity = np.random.uniform(40.0, 99.0, n)
    carat = np.random.uniform(1.0, 35.0, n)
    depth = np.random.uniform(100.0, 800.0, n)
    hardness = np.random.uniform(5.0, 10.0, n)
    
    # Non-linear valuation formula with noise
    value = (
        12.0 * (purity ** 1.35) +
        35.0 * (carat ** 1.25) +
        18.0 * (hardness ** 1.5) -
        0.05 * depth +
        0.4 * (purity * carat) ** 0.5 +
        np.random.normal(0, 40.0, n)
    )
    value = np.clip(value, 200, 15000).round(1)
    
    df = pd.DataFrame({
        'Sample_ID': [f"VAULT-{500+i}" for i in range(n)],
        'Ore_Purity_Pct': purity.round(2),
        'Carat_Size': carat.round(2),
        'Extraction_Depth_m': depth.round(1),
        'Hardness_Mohs': hardness.round(2),
        'Vault_Value_Gold': value
    })
    
    out_path = os.path.join(DATASET_DIR, "final_vault_ores.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated Level 5 dataset: {out_path} ({len(df)} rows)")
    return out_path

def generate_all_datasets():
    ensure_dirs()
    generate_level1_data()
    generate_level2_data()
    generate_level3_data()
    generate_level4_data()
    generate_level5_data()
    print("All datasets generated successfully!")

if __name__ == '__main__':
    generate_all_datasets()
