"""
Level 1 Data Science Engine: Missing Value Imputation
Uses Pandas to inspect and clean damaged mineral records.
"""

import os
import pandas as pd
import numpy as np

DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets", "minerals_exploration.csv")

def get_raw_data():
    """Returns raw damaged mineral dataset with missing value statistics."""
    df = pd.read_csv(DATASET_PATH)
    total_cells = df.size
    total_missing = int(df.isna().sum().sum())
    missing_by_col = df.isna().sum().to_dict()
    
    # Identify rows that have at least one missing value
    rows_with_na = df[df.isna().any(axis=1)].replace({np.nan: None}).to_dict(orient='records')
    preview = df.head(10).replace({np.nan: None}).to_dict(orient='records')
    
    # Calculate initial stats for numeric columns
    numeric_stats = {}
    for col in ['Weight_Carats', 'Hardness_Mohs', 'Estimated_Value_Coins']:
        series = df[col].dropna()
        numeric_stats[col] = {
            'mean': round(float(series.mean()), 2),
            'median': round(float(series.median()), 2),
            'std': round(float(series.std()), 2),
            'missing_count': int(df[col].isna().sum())
        }
        
    return {
        'total_rows': len(df),
        'total_missing': total_missing,
        'missing_percentage': round((total_missing / total_cells) * 100, 1),
        'missing_by_column': missing_by_col,
        'numeric_stats': numeric_stats,
        'damaged_samples': rows_with_na[:6], # Show up to 6 damaged records
        'preview': preview
    }

def clean_data(strategy='median', custom_fill=None):
    """
    Cleans the mineral records using Pandas imputation.
    Strategies:
      - 'median': Impute numeric columns with their median (robust against outliers)
      - 'mean': Impute numeric columns with their mean
      - 'mode': Impute categorical / numeric with mode
      - 'drop': Drop any rows containing NaN values
    """
    df = pd.read_csv(DATASET_PATH)
    original_len = len(df)
    missing_before = int(df.isna().sum().sum())
    numeric_cols = ['Weight_Carats', 'Hardness_Mohs', 'Estimated_Value_Coins']
    
    imputed_values = {}
    
    if strategy == 'drop':
        cleaned_df = df.dropna().copy()
        imputed_values['rows_dropped'] = original_len - len(cleaned_df)
    elif strategy == 'mean':
        cleaned_df = df.copy()
        for col in numeric_cols:
            mean_val = round(float(cleaned_df[col].mean()), 2)
            imputed_values[col] = mean_val
            cleaned_df[col] = cleaned_df[col].fillna(mean_val)
    elif strategy == 'median':
        cleaned_df = df.copy()
        for col in numeric_cols:
            med_val = round(float(cleaned_df[col].median()), 2)
            imputed_values[col] = med_val
            cleaned_df[col] = cleaned_df[col].fillna(med_val)
    elif strategy == 'mode':
        cleaned_df = df.copy()
        for col in numeric_cols:
            mode_val = float(cleaned_df[col].mode()[0])
            imputed_values[col] = mode_val
            cleaned_df[col] = cleaned_df[col].fillna(mode_val)
    else:
        raise ValueError(f"Unknown strategy: {strategy}")
        
    missing_after = int(cleaned_df.isna().sum().sum())
    
    # Calculate post-cleaning metrics
    post_stats = {}
    for col in numeric_cols:
        post_stats[col] = {
            'mean': round(float(cleaned_df[col].mean()), 2),
            'median': round(float(cleaned_df[col].median()), 2),
            'std': round(float(cleaned_df[col].std()), 2)
        }
        
    # Check if Diamond and Sapphire records were restored
    restored_samples = cleaned_df[cleaned_df['Mineral'].isin(['Diamond', 'Sapphire', 'Ruby', 'Emerald'])].head(5).to_dict(orient='records')
    
    # Evaluation explanation
    if strategy in ['median', 'mean']:
        success = True
        explanation = (
            f"Successfully imputed missing values using {strategy.upper()}! "
            f"All {missing_before} gaps in the mineral survey were filled without discarding precious specimens. "
            f"The ancient mining database is completely restored!"
        )
    elif strategy == 'drop':
        success = True
        explanation = (
            f"Rows with missing data dropped ({imputed_values['rows_dropped']} rows lost). "
            f"While the remaining {len(cleaned_df)} records are clean, discarding damaged records lost some valuable mineral locations!"
        )
    else:
        success = True
        explanation = f"Imputed values using {strategy}. Data is now complete."
        
    return {
        'success': success,
        'strategy_used': strategy,
        'missing_before': missing_before,
        'missing_after': missing_after,
        'imputed_values': imputed_values,
        'post_stats': post_stats,
        'restored_samples': restored_samples,
        'explanation': explanation,
        'rows_remaining': len(cleaned_df)
    }
