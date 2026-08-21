import os
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

_pipeline = None
MODEL_FILE = os.path.join(os.path.dirname(__file__), 'attrition_model.pkl')

def get_ml_pipeline():
    global _pipeline
    if _pipeline is not None:
        return _pipeline

    # 1. Load pre-trained cached model if it exists (Instant, no re-training)
    if os.path.exists(MODEL_FILE):
        try:
            _pipeline = joblib.load(MODEL_FILE)
            return _pipeline
        except Exception:
            pass

    # 2. Train ONCE if cached model does not exist
    possible_paths = [
        os.path.join(os.path.dirname(__file__), 'Dataset.csv'),
        os.path.join(os.path.dirname(__file__), 'data', 'Dataset.csv'),
        os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dist', 'Employee-Attrition-main', 'Dataset.csv'),
        os.path.join(os.path.dirname(os.path.dirname(__file__)), 'server', 'data', 'Dataset.csv'),
    ]

    csv_path = None
    for path in possible_paths:
        if os.path.exists(path):
            csv_path = path
            break

    if not csv_path:
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

    # Save model to disk so it never trains again on startup
    try:
        joblib.dump(_pipeline, MODEL_FILE)
    except Exception:
        pass

    return _pipeline

def predict_attrition(employee_data: dict) -> float:
    pipeline = get_ml_pipeline()
    if not pipeline:
        return 0.0

    df_input = pd.DataFrame([employee_data])
    proba = pipeline.predict_proba(df_input)[0][1]
    return float(proba)
