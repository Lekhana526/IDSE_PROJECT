import os
import warnings
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import TimeSeriesSplit, GridSearchCV
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.dummy import DummyRegressor
from sklearn.base import clone
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

warnings.filterwarnings('ignore')
sns.set_theme(style="whitegrid")
# Creating a folder to save the graphs
os.makedirs("figures", exist_ok=True)
#reading the data from the csv file
df = pd.read_csv("SeoulBikeData.csv",encoding="latin1")
#printing the basic information about the dataset
print("\n========== DATASET INFORMATION ==========")
print("\nFirst 5 records:")
print(df.head())

print("\nLast 5 records:")
print(df.tail())

print("\nDataset Shape:")
print(df.shape)

print("\nColumn Information:")
print(df.info())

print("\nStatistical Summary:")
print(df.describe())

print("\nMissing Values:")
print(df.isnull().sum())

print("\nTotal Missing Values:")
print(df.isnull().sum().sum())

print("\nDuplicate Records:")
print(df.duplicated().sum())
#data cleaning
# Converting the date column into proper format
df['Date'] = pd.to_datetime(df['Date'],format='%d/%m/%Y')

# Sort data chronologically
df = df.sort_values(['Date', 'Hour']).reset_index(drop=True)

# Check missing values
print("\nMissing values before cleaning:")
print(df.isnull().sum().sum())

# Remove duplicate records if present
df = df.drop_duplicates().copy()

# Check target variable
print("\nTarget variable summary:")
print(df['Rented Bike Count'].describe())

# Check non-functioning days
print("\nFunctioning Day Distribution:")
print(df['Functioning Day'].value_counts())
print("\nRental count on non-functioning days:")
print(
    df[df['Functioning Day'] == 'No']
    ['Rented Bike Count'].value_counts()
)

# Identify outliers using IQR method
# We identify them but do not automatically remove them.
Q1 = df['Rented Bike Count'].quantile(0.25)
Q3 = df['Rented Bike Count'].quantile(0.75)
IQR = Q3 - Q1

lower_limit = Q1 - 1.5 * IQR
upper_limit = Q3 + 1.5 * IQR

outliers = df[(df['Rented Bike Count'] < lower_limit) |(df['Rented Bike Count'] > upper_limit)]

print("\n========== OUTLIER ANALYSIS ==========")
print("Lower Limit:", lower_limit)
print("Upper Limit:", upper_limit)
print("Number of potential outliers:", len(outliers))

# Boxplot
plt.figure(figsize=(9, 5))
sns.boxplot(y=df['Rented Bike Count'])
plt.title("Outlier Analysis of Bike Rentals")
plt.ylabel("Rented Bike Count")
plt.tight_layout()
plt.savefig("figures/01_outlier_analysis.png")
plt.show()

#FEATURE ENGINEERING
# Extract date-related features
df['Year'] = df['Date'].dt.year
df['Month'] = df['Date'].dt.month
df['Day'] = df['Date'].dt.day
df['DayOfWeek'] = df['Date'].dt.dayofweek

# Weekend feature
df['IsWeekend'] = (df['DayOfWeek'] >= 5).astype(int)

# Cyclical hour encoding
df['Hour_sin'] = np.sin(2 * np.pi * df['Hour'] / 24)

df['Hour_cos'] = np.cos(2 * np.pi * df['Hour'] / 24)

# Cyclical month encoding
df['Month_sin'] = np.sin(2 * np.pi * (df['Month'] - 1) / 12)

df['Month_cos'] = np.cos(2 * np.pi * (df['Month'] - 1) / 12)

print("\n========== FEATURE ENGINEERING ==========")
print(df.head())
print("\nNew Dataset Shape:")
print(df.shape)

# 6. EXPLORATORY DATA ANALYSIS (EDA)
#graph on distribution of bike rentals
plt.figure(figsize=(9, 5))
sns.histplot(df['Rented Bike Count'],bins=40,kde=True)
plt.title("Distribution of Bike Rentals")
plt.xlabel("Rented Bike Count")
plt.ylabel("Frequency")
plt.tight_layout()
plt.savefig("figures/02_rental_distribution.png")
plt.show()

#graph for average bike rentals by hour
hourly_demand = df.groupby('Hour')['Rented Bike Count'].mean()
plt.figure(figsize=(10, 5))
hourly_demand.plot(kind='line',marker='o')
plt.title("Average Bike Rentals by Hour")
plt.xlabel("Hour of the Day")
plt.ylabel("Average Bike Rentals")
plt.xticks(range(24))
plt.grid(True)
plt.tight_layout()
plt.savefig("figures/03_hourly_demand.png")
plt.show()
print("\nAverage rentals by hour:")
print(hourly_demand.sort_values(ascending=False))

#graph for seasonal bike rental demand
season_demand = df.groupby('Seasons')['Rented Bike Count'].mean()
plt.figure(figsize=(8, 5))
sns.barplot(
    data=df,
    x='Seasons',
    y='Rented Bike Count',
    order=['Spring', 'Summer', 'Autumn', 'Winter'],
    estimator='mean',
    errorbar=None
)
plt.title("Average Bike Rentals by Season")
plt.xlabel("Season")
plt.ylabel("Average Rentals")
plt.tight_layout()
plt.savefig("figures/04_seasonal_demand.png")
plt.show()
print("\nSeasonal Demand:")
print(season_demand.sort_values(ascending=False))

#graph on temperature vs bike rentals
plt.figure(figsize=(9, 5))
sns.scatterplot(
    data=df,
    x='Temperature(°C)',
    y='Rented Bike Count',
    alpha=0.4
)
plt.title("Temperature vs Bike Rentals")
plt.xlabel("Temperature (°C)")
plt.ylabel("Rented Bike Count")
plt.tight_layout()
plt.savefig("figures/05_temperature_vs_rentals.png")
plt.show()

#graph on rainfall vs bike rentals
plt.figure(figsize=(9, 5))
sns.scatterplot(
    data=df,
    x='Rainfall(mm)',
    y='Rented Bike Count',
    alpha=0.4
)
plt.title("Rainfall vs Bike Rentals")
plt.xlabel("Rainfall (mm)")
plt.ylabel("Rented Bike Count")
plt.tight_layout()
plt.savefig("figures/06_rainfall_vs_rentals.png")
plt.show()

#graph on weekday vs weekend demand
plt.figure(figsize=(8, 5))
sns.barplot(
    data=df,
    x='IsWeekend',
    y='Rented Bike Count',
    estimator='mean',
    errorbar=None
)
plt.xticks(
    [0, 1],
    ['Weekday', 'Weekend']
)
plt.title("Weekday vs Weekend Bike Rentals")
plt.xlabel("Day Type")
plt.ylabel("Average Rentals")
plt.tight_layout()
plt.savefig("figures/07_weekday_weekend.png")
plt.show()
print("\nWeekday and Weekend Demand:")
print(
    df.groupby('IsWeekend')['Rented Bike Count'].mean()
)

#graph on holiday vs non-holiday demand
plt.figure(figsize=(8, 5))
sns.barplot(
    data=df,
    x='Holiday',
    y='Rented Bike Count',
    estimator='mean',
    errorbar=None
)
plt.title("Holiday vs Non-Holiday Bike Rentals")
plt.xlabel("Holiday Status")
plt.ylabel("Average Rentals")
plt.tight_layout()
plt.savefig("figures/08_holiday_demand.png")
plt.show()
print("\nHoliday Demand:")
print(df.groupby('Holiday')['Rented Bike Count'].mean())

#correlation heatmap
numeric_df = df.select_dtypes(include=np.number)
plt.figure(figsize=(14, 9))
sns.heatmap(
    numeric_df.corr(),
    annot=True,
    cmap='coolwarm',
    fmt='.2f'
)
plt.title("Correlation Heatmap")
plt.tight_layout()
plt.savefig("figures/09_correlation_heatmap.png")
plt.show()

# 7. DEFINE INPUT FEATURES AND TARGET VARIABLE
features = [
    'Hour',
    'Temperature(°C)',
    'Humidity(%)',
    'Wind speed (m/s)',
    'Visibility (10m)',
    'Dew point temperature(°C)',
    'Solar Radiation (MJ/m2)',
    'Rainfall(mm)',
    'Snowfall (cm)',
    'Seasons',
    'Holiday',
    'Functioning Day',
    'Month',
    'DayOfWeek',
    'IsWeekend',
    'Hour_sin',
    'Hour_cos',
    'Month_sin',
    'Month_cos'
]
X = df[features]
y = df['Rented Bike Count']
print("\nInput Features:")
print(X.head())
print("\nTarget Variable:")
print(y.head())


# 8. TRAIN-VALIDATION-TEST SPLIT

# Chronological split: 70% training, 15% validation, 15% testing

total = len(df)

train_end = int(total * 0.70)
val_end = int(total * 0.85)

# Split input features
X_train = X.iloc[:train_end].copy()
X_val = X.iloc[train_end:val_end].copy()
X_test = X.iloc[val_end:].copy()

# Split target variable
y_train = y.iloc[:train_end].copy()
y_val = y.iloc[train_end:val_end].copy()
y_test = y.iloc[val_end:].copy()

print("\n========== TRAIN VALIDATION TEST SPLIT ==========")

print("Training Records:", len(X_train))
print("Validation Records:", len(X_val))
print("Testing Records:", len(X_test))

print("\nTraining Period:",
      df['Date'].iloc[0], "to",
      df['Date'].iloc[train_end - 1])

print("Validation Period:",
      df['Date'].iloc[train_end], "to",
      df['Date'].iloc[val_end - 1])

print("Testing Period:",
      df['Date'].iloc[val_end], "to",
      df['Date'].iloc[-1])


# 9. PREPROCESSING

categorical_features = ['Seasons', 'Holiday','Functioning Day']

numerical_features = [
    col for col in features
    if col not in categorical_features
]

# Numerical preprocessing
numeric_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

# Categorical preprocessing
categorical_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('encoder', OneHotEncoder(handle_unknown='ignore'))
])

# Combine preprocessing
preprocessor = ColumnTransformer([
    ('num', numeric_transformer, numerical_features),
    ('cat', categorical_transformer, categorical_features)
])


# 10. MODEL 1: MEAN BASELINE

print("\n========== MEAN BASELINE ==========")
baseline_model = Pipeline([
    ('preprocessor', preprocessor),
    ('model', DummyRegressor(strategy='mean'))
])

# Train using training data only
baseline_model.fit(X_train, y_train)

# Predict validation data for model selection
baseline_val_predictions = baseline_model.predict(X_val)
print("Mean Baseline Model Trained Successfully.")
print("First 10 Validation Predictions:")
print(baseline_val_predictions[:10])

# 11. MODEL 2: LINEAR REGRESSION

print("\n========== LINEAR REGRESSION ==========")
lr_model = Pipeline([
    ('preprocessor', preprocessor),
    ('model', LinearRegression())
])

# Train using training data only
lr_model.fit(X_train, y_train)

# Predict validation data for model selection
lr_val_predictions = lr_model.predict(X_val)
print("Linear Regression Model Trained Successfully.")
print("First 10 Validation Predictions:")
print(lr_val_predictions[:10])

# 12. MODEL 3: RANDOM FOREST REGRESSOR

print("\n========== RANDOM FOREST REGRESSOR ==========")
rf_pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('model', RandomForestRegressor(
        random_state=42,
        n_jobs=-1
    ))
])

# Time Series Cross Validation - training data only
# Hyperparameter tuning does not use validation or test data.
tscv = TimeSeriesSplit(n_splits=3)

param_grid = {
    'model__n_estimators': [100],
    'model__max_depth': [10, 20],
    'model__min_samples_leaf': [1, 2]
}

grid_search = GridSearchCV(
    estimator=rf_pipeline,
    param_grid=param_grid,
    cv=tscv,
    scoring='neg_mean_absolute_error',
    n_jobs=-1,
    verbose=1
)

grid_search.fit(X_train, y_train)
rf_model = grid_search.best_estimator_

# Predict validation data for model selection
rf_val_predictions = rf_model.predict(X_val)

print("\nBest Random Forest Parameters:")
print(grid_search.best_params_)
print("\nBest Cross Validation MAE:")
print(-grid_search.best_score_)
print("\nRandom Forest Model Trained Successfully.")

# 13. MODEL SELECTION USING VALIDATION DATA

print("\n========== VALIDATION MODEL COMPARISON ==========")
validation_predictions = {
    'Mean Baseline': baseline_val_predictions,
    'Linear Regression': lr_val_predictions,
    'Random Forest': rf_val_predictions
}

validation_results = []
for model_name, pred in validation_predictions.items():
    val_mae = mean_absolute_error(y_val, pred)
    val_rmse = np.sqrt(mean_squared_error(y_val, pred))
    val_r2 = r2_score(y_val, pred)
    validation_results.append({
        'Model': model_name,
        'Validation MAE': val_mae,
        'Validation RMSE': val_rmse,
        'Validation R2': val_r2
    })

validation_results_df = pd.DataFrame(validation_results)
print("\nVALIDATION COMPARISON TABLE:")
print(validation_results_df.round(3))
validation_results_df.to_csv("validation_model_comparison.csv", index=False)

# Select the best model using validation MAE.
# The Mean Baseline is a reference, not a candidate for final ML model selection.
ml_validation_results = validation_results_df[
    validation_results_df['Model'].isin(['Linear Regression', 'Random Forest'])
]
best_model_name = ml_validation_results.loc[
    ml_validation_results['Validation MAE'].idxmin(), 'Model'
]

print("\n========== BEST MODEL SELECTED FROM VALIDATION ==========")
print("Best Model Based on Validation MAE:", best_model_name)

# 14. RETRAIN MODELS USING TRAINING + VALIDATION DATA

print("\n========== FINAL TRAINING ==========")
X_train_final = pd.concat([X_train, X_val])
y_train_final = pd.concat([y_train, y_val])

# Refit each model on the combined training and validation data.
# This allows a fair final test comparison of all three models.
baseline_final = Pipeline([
    ('preprocessor', preprocessor),
    ('model', DummyRegressor(strategy='mean'))
])
baseline_final.fit(X_train_final, y_train_final)

lr_final = Pipeline([
    ('preprocessor', preprocessor),
    ('model', LinearRegression())
])
lr_final.fit(X_train_final, y_train_final)

rf_final = clone(rf_model)
rf_final.fit(X_train_final, y_train_final)

# 15. FINAL TEST PREDICTIONS - TEST DATA IS USED ONLY HERE
baseline_predictions = baseline_final.predict(X_test)
lr_predictions = lr_final.predict(X_test)
rf_predictions = rf_final.predict(X_test)

# Use the validation-selected model for all subsequent best-model plots/analysis.
if best_model_name == 'Linear Regression':
    best_final_model = lr_final
    best_predictions = lr_predictions
else:
    best_final_model = rf_final
    best_predictions = rf_predictions

# 16. FINAL MODEL EVALUATION ON THE UNTOUCHED TEST SET

print("\n========== FINAL TEST MODEL EVALUATION ==========")
predictions = {
    'Mean Baseline': baseline_predictions,
    'Linear Regression': lr_predictions,
    'Random Forest': rf_predictions
}

results = []
for model_name, pred in predictions.items():
    mae = mean_absolute_error(y_test, pred)
    rmse = np.sqrt(mean_squared_error(y_test, pred))
    r2 = r2_score(y_test, pred)
    results.append({
        'Model': model_name,
        'MAE': mae,
        'RMSE': rmse,
        'R2': r2
    })

results_df = pd.DataFrame(results)
print("\nFINAL TEST MODEL COMPARISON TABLE:")
print(results_df.round(3))
results_df.to_csv("model_comparison.csv", index=False)

#MODEL COMPARISON GRAPH

# MAE comparison
plt.figure(figsize=(9, 5))
sns.barplot(data=results_df,x='Model',y='MAE')
plt.title("Model Comparison - MAE")
plt.ylabel("Mean Absolute Error")
plt.xticks(rotation=15)
plt.tight_layout()
plt.savefig("figures/10_model_mae_comparison.png")
plt.show()

# RMSE comparison
plt.figure(figsize=(9, 5))
sns.barplot(data=results_df,x='Model',y='RMSE')
plt.title("Model Comparison - RMSE")
plt.ylabel("Root Mean Squared Error")
plt.xticks(rotation=15)
plt.tight_layout()
plt.savefig("figures/11_model_rmse_comparison.png")
plt.show()

# R2 comparison
plt.figure(figsize=(9, 5))
sns.barplot(data=results_df,x='Model',y='R2')
plt.title("Model Comparison - R2 Score")
plt.ylabel("R2 Score")
plt.xticks(rotation=15)
plt.tight_layout()
plt.savefig("figures/12_model_r2_comparison.png")
plt.show()

#IDENTIFY BEST MODEL
# The best model was selected earlier using validation MAE.
# Test results are reported for evaluation only; they do not change model selection.
print("\n========== BEST MODEL ==========")
print("Best Model Based on Validation MAE:", best_model_name)
print("Selected Model Test MAE:", mean_absolute_error(y_test, best_predictions))

#ACTUAL VS PREDICTED VALUES
plt.figure(figsize=(9, 6))
plt.scatter(y_test,best_predictions,alpha=0.4)

# Ideal prediction line
minimum = min(y_test.min(),best_predictions.min())
maximum = max(y_test.max(),best_predictions.max())
plt.plot([minimum, maximum],[minimum, maximum],'r--',label='Perfect Prediction')
plt.xlabel("Actual Bike Rentals")
plt.ylabel("Predicted Bike Rentals")
plt.title("Actual vs Predicted Bike Rentals - " +best_model_name)
plt.legend()
plt.tight_layout()
plt.savefig("figures/13_actual_vs_predicted.png")
plt.show()

#ACTUAL VS PREDICTED OVER TIME
# Display first 168 test hours (one week)
plt.figure(figsize=(14, 6))
plt.plot(
    y_test.iloc[:168].values,
    label='Actual',
    marker='o',
    markersize=3
)
plt.plot(
    best_predictions[:168],
    label='Predicted',
    marker='x',
    markersize=3
)
plt.title("Actual vs Predicted Demand Over One Week")
plt.xlabel("Test Hour")
plt.ylabel("Rented Bike Count")
plt.legend()
plt.tight_layout()
plt.savefig("figures/14_prediction_over_time.png")
plt.show()

#PEAK AND NON-PEAK DEMAND ANALYSIS
print("\n========== PEAK AND NON-PEAK ANALYSIS ==========")

# Define peak threshold using training data only
peak_threshold = y_train.quantile(0.75)
print("Peak Demand Threshold:", peak_threshold)

# Divide test observations
peak_mask = y_test >= peak_threshold
nonpeak_mask = y_test < peak_threshold
print("\nPeak Records:", peak_mask.sum())
print("Non-Peak Records:", nonpeak_mask.sum())

# Evaluate all models separately
peak_results = []
for model_name, pred in predictions.items():
    peak_mae = mean_absolute_error(
        y_test[peak_mask],
        pred[peak_mask]
    )
    peak_rmse = np.sqrt(
        mean_squared_error(
            y_test[peak_mask],
            pred[peak_mask]
        )
    )
    nonpeak_mae = mean_absolute_error(
        y_test[nonpeak_mask],
        pred[nonpeak_mask]
    )
    nonpeak_rmse = np.sqrt(
        mean_squared_error(
            y_test[nonpeak_mask],
            pred[nonpeak_mask]
        )
    )
    peak_results.append({
        'Model': model_name,
        'Peak MAE': peak_mae,
        'Peak RMSE': peak_rmse,
        'Non-Peak MAE': nonpeak_mae,
        'Non-Peak RMSE': nonpeak_rmse
    })
peak_results_df = pd.DataFrame(peak_results)
print("\nPEAK VS NON-PEAK MODEL COMPARISON:")
print(peak_results_df.round(3))
peak_results_df.to_csv("peak_nonpeak_comparison.csv",index=False)

# 19. PEAK VS NON-PEAK GRAPH
peak_plot = peak_results_df.melt(
    id_vars='Model',
    value_vars=['Peak MAE', 'Non-Peak MAE'],
    var_name='Demand Period',
    value_name='MAE'
)
plt.figure(figsize=(10, 6))
sns.barplot(
    data=peak_plot,
    x='Model',
    y='MAE',
    hue='Demand Period'
)
plt.title("Peak vs Non-Peak Prediction Errors")
plt.ylabel("Mean Absolute Error")
plt.xticks(rotation=15)
plt.tight_layout()
plt.savefig("figures/15_peak_nonpeak_comparison.png")
plt.show()

#RANDOM FOREST FEATURE IMPORTANCE

print("\n========== FEATURE IMPORTANCE ==========")
# Get the trained preprocessing transformer
trained_preprocessor = rf_final.named_steps['preprocessor']

# Get transformed feature names
feature_names = trained_preprocessor.get_feature_names_out()

# Get Random Forest feature importance
importances = rf_final.named_steps['model'].feature_importances_
importance_df = pd.DataFrame({'Feature': feature_names,'Importance': importances})
importance_df = importance_df.sort_values(by='Importance',ascending=False)
print("\nTop 15 Important Features:")
print(importance_df.head(15))

# Feature importance graph
plt.figure(figsize=(11, 7))
sns.barplot(data=importance_df.head(15),x='Importance',y='Feature')
plt.title("Top 15 Random Forest Feature Importances")
plt.tight_layout()
plt.savefig("figures/16_feature_importance.png")
plt.show()

#Residual analysis
residuals = y_test.values - best_predictions
plt.figure(figsize=(9, 5))
sns.histplot(residuals,bins=40,kde=True)
plt.axvline(0,color='red',linestyle='--')
plt.title("Residual Distribution of Best Model")
plt.xlabel("Prediction Error (Actual - Predicted)")
plt.ylabel("Frequency")
plt.tight_layout()
plt.savefig("figures/17_residual_distribution.png")
plt.show()

#final project summary
print("\n")
print("-" * 60)
print("             BIKEWISE PROJECT SUMMARY")
print("-" * 60)
print("\nDataset Records:", len(df))
print("Dataset Features:", len(features))
print("Training Records:", len(X_train))
print("Validation Records:", len(X_val))
print("Testing Records:", len(X_test))
print("\nBest Model:", best_model_name)
print("\nFINAL MODEL COMPARISON:")
print(results_df.round(3).to_string(index=False))
print("\nPEAK VS NON-PEAK ANALYSIS:")
print(peak_results_df.round(3).to_string(index=False))
print("\nPeak Demand Threshold:", peak_threshold)
print("\nTop 5 Important Features:")
print(importance_df.head(5).to_string(index=False))
print("\nAll graphs saved in the figures folder.")
print("\nComparison tables saved as CSV files.")
print("\nBIKEWISE PROJECT COMPLETED SUCCESSFULLY!")
print("=" * 60)
