BIKEWISE – Weather-Aware Bike Sharing Demand Prediction

About the Project
BIKEWISE is a machine learning project that focuses on predicting bike-sharing demand based on weather conditions, time, and other environmental factors.
The project uses the Seoul Bike Sharing dataset to understand how different factors, such as temperature, humidity, rainfall, seasons, and holidays, influence the number of rented bikes.
The main aim is to compare different prediction models and identify which one performs better in estimating bike rental demand. This can help bike-sharing services plan bike availability more effectively, especially during peak and non-peak hours.

Dataset
- Dataset Name: Seoul Bike Sharing Dataset
- File: "SeoulBikeData.csv"
- Target Variable: Rented Bike Count
The dataset contains hourly bike rental records along with weather information and other details.

Some of the features used include:
- Hour
- Temperature
- Humidity
- Wind Speed
- Visibility
- Rainfall
- Snowfall
- Seasons
- Holiday
- Functioning Day

Technologies and Libraries Used
- Python
- Pandas – Data handling and analysis
- NumPy – Numerical operations
- Matplotlib – Data visualization
- Seaborn – Statistical graphs
- Scikit-learn – Machine learning and model evaluation

Project Workflow
1. Data Loading: Read the Seoul Bike Sharing dataset and examine its structure.
2. Data Cleaning: Check for missing values, duplicate records, and unusual observations.
3. Outlier Analysis: Identify possible outliers in bike rental counts using the IQR method.
4. Feature Engineering: Extract useful information such as month, day, weekday, weekend, and cyclical time features.
5. Exploratory Data Analysis: Study rental patterns using different graphs and visualizations.
6. Data Preprocessing: Apply scaling to numerical features and one-hot encoding to categorical features.
7. Model Training: Train and compare three different prediction approaches.
8. Model Evaluation: Evaluate model performance using MAE, RMSE, and R² score.
9. Demand Analysis: Compare prediction errors during peak and non-peak demand periods.
10. Feature Importance: Identify the factors that contribute most to the Random Forest predictions.
11. Residual Analysis: Examine prediction errors to understand model performance.

Machine Learning Models
The following models are implemented in this project:
1. Mean Baseline
Uses the average bike rental count from the training data as the prediction for every test record. It serves as a basic reference for comparing the other models.

2. Linear Regression
Uses the relationship between input features and bike rental counts to predict demand.

3. Random Forest Regressor
Uses multiple decision trees to capture complex relationships between weather conditions, time, and bike rental demand. GridSearchCV with TimeSeriesSplit is used for hyperparameter tuning.

Model Evaluation Metrics

The models are evaluated using:
- MAE (Mean Absolute Error): Measures the average absolute difference between actual and predicted rental counts.
- RMSE (Root Mean Squared Error): Measures prediction error while giving more weight to larger errors.
- R² Score: Indicates how well the model explains variations in bike rental demand.

The model with the lowest MAE is selected as the best-performing model.

Visualizations

The project generates graphs to understand different aspects of bike-sharing demand, including:
- Distribution of bike rentals
- Average rentals by hour
- Seasonal demand patterns
- Temperature vs. bike rentals
- Rainfall vs. bike rentals
- Weekday vs. weekend demand
- Holiday vs. non-holiday demand
- Correlation heatmap
- Model performance comparison
- Actual vs. predicted values
- Peak vs. non-peak demand
- Random Forest feature importance
- Residual distribution

All generated graphs are saved in the "figures" folder.

How to Run the Project

1. Clone the repository

git clone <your-repository-link>
c
2. Move into the project folder

cd BIKEWISE

3. Install the required libraries

pip install pandas numpy matplotlib seaborn scikit-learn

4. Place the dataset

Keep "SeoulBikeData.csv" in the same folder as the Python script.

5. Run the Python file

python bikewise.py

Output Files

After execution, the project generates:

- "figures/" – Contains the graphs produced during analysis.
- "model_comparison.csv" – Contains the performance comparison of all three models.
- "peak_nonpeak_comparison.csv" – Contains the prediction error comparison for peak and non-peak demand.

Conclusion

BIKEWISE explores how weather conditions, time, and other factors affect bike-sharing demand. By comparing a baseline approach, Linear Regression, and Random Forest, the project provides an understanding of how different machine learning techniques perform on demand prediction.

The analysis also looks at peak and non-peak demand separately, helping to understand where prediction errors occur and which features have a greater influence on rental patterns.

This project was developed as part of an academic machine learning and data analysis study.
