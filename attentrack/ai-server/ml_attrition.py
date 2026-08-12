import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

_pipeline = None

def get_ml_pipeline():
    global _pipeline
    if _pipeline is not None:
        return _pipeline
    
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dist', 'Employee-Attrition-main', 'Dataset.csv')
    
    if not os.path.exists(csv_path):
        print(f"Warning: Dataset not found at {csv_path}")
        return None

    df = pd.read_csv(csv_path)
    
    # Drop columns that have no variance or are identifiers
    cols_to_drop = ['EmployeeCount', 'EmployeeNumber', 'Over18', 'StandardHours']
    df = df.drop(columns=[c for c in cols_to_drop if c in df.columns])

    y = df['Attrition'].map({'Yes': 1, 'No': 0})
    X = df.drop(columns=['Attrition'])

    numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_features = X.select_dtypes(include=['object']).columns.tolist()

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])

    _pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced'))
    ])

    _pipeline.fit(X, y)
    print("✅ Successfully trained IBM Attrition Machine Learning Model.")
    return _pipeline

def predict_attrition(employee_data: dict) -> float:
    pipeline = get_ml_pipeline()
    if not pipeline:
        return 0.0 # fallback

    # Convert the single employee dict into a DataFrame with 1 row
    # The keys must match the Dataset.csv columns!
    df_input = pd.DataFrame([employee_data])
    
    # We only predict probability of class 1 (Attrition = Yes)
    proba = pipeline.predict_proba(df_input)[0][1]
    return float(proba)

# Initialize on import
get_ml_pipeline()
