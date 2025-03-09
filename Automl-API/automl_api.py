import pandas as pd
import numpy as np
import joblib
import json
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder, MinMaxScaler
from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from xgboost import XGBClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, classification_report, confusion_matrix

# Load dataset
file_path = "LIR.csv"  # Change this to the full path of your dataset
df = pd.read_csv(file_path)

# Define target column
target_column = "class"  # Adjust if needed

# Detect categorical and numerical columns
categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
numerical_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()

# Handle missing values (User can select strategy: 'median', 'mean', 'mode', 'knn', 'remove')
missing_value_strategy = "median"  # Change as needed
if missing_value_strategy == 'median':
    df.fillna(df.median(numeric_only=True), inplace=True)
elif missing_value_strategy == 'mean':
    df.fillna(df.mean(numeric_only=True), inplace=True)
elif missing_value_strategy == 'mode':
    df.fillna(df.mode().iloc[0], inplace=True)
elif missing_value_strategy == 'knn':
    imputer = KNNImputer(n_neighbors=5)
    df[numerical_cols] = imputer.fit_transform(df[numerical_cols])
elif missing_value_strategy == 'remove':
    df.dropna(inplace=True)

# Encode categorical target variable
label_encoder = LabelEncoder()
df[target_column] = label_encoder.fit_transform(df[target_column])

# Normalize numerical data (User can choose 'standard' or 'minmax')
scaling_strategy = "standard"  # Change as needed
if scaling_strategy == "standard":
    scaler = StandardScaler()
elif scaling_strategy == "minmax":
    scaler = MinMaxScaler()
df[numerical_cols] = scaler.fit_transform(df[numerical_cols])

# Split dataset
X = df.drop(columns=[target_column])
y = df[target_column]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Define hyperparameter grids
param_grids = {
    'Logistic Regression': {'C': [0.01, 0.1, 1, 10, 100], 'solver': ['liblinear', 'lbfgs']},
    'Random Forest': {'n_estimators': [50, 100, 200], 'max_depth': [None, 10, 20, 30]},
    'XGBoost': {'learning_rate': [0.01, 0.1, 0.2], 'n_estimators': [50, 100, 200], 'max_depth': [3, 5, 7]},
    'SVM': {'C': [0.1, 1, 10], 'kernel': ['linear', 'rbf']},
    'Naive Bayes': {},
    'KNN': {'n_neighbors': [3, 5, 7]},
    'Gradient Boosting': {'learning_rate': [0.01, 0.1, 0.2], 'n_estimators': [50, 100, 200], 'max_depth': [3, 5, 7]}
}

# Define models
models = {
    'Logistic Regression': LogisticRegression(max_iter=500),
    'Random Forest': RandomForestClassifier(),
    'XGBoost': XGBClassifier(use_label_encoder=False, eval_metric='logloss'),
    'SVM': SVC(probability=True),
    'Naive Bayes': GaussianNB(),
    'KNN': KNeighborsClassifier(),
    'Gradient Boosting': GradientBoostingClassifier()
}

best_model = None
best_accuracy = 0
results = {}

# Train and tune models
for name, model in models.items():
    print(f"Tuning hyperparameters for {name}...")
    if param_grids[name]:
        grid_search = GridSearchCV(model, param_grids[name], cv=5, scoring='accuracy', n_jobs=-1)
        grid_search.fit(X_train, y_train)
        best_estimator = grid_search.best_estimator_
    else:
        best_estimator = model.fit(X_train, y_train)
    
    y_pred = best_estimator.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    results[name] = accuracy

    if accuracy > best_accuracy:
        best_accuracy = accuracy
        best_model = name
        best_model_instance = best_estimator

# Save the best model
joblib.dump(best_model_instance, "best_model.pkl")

# Generate Evaluation Metrics
conf_matrix = confusion_matrix(y_test, y_pred)
class_report = classification_report(y_test, y_pred, output_dict=True)
cross_val_scores = cross_val_score(best_model_instance, X, y, cv=5, scoring='accuracy')
mean_cv_accuracy = np.mean(cross_val_scores)
train_acc = best_model_instance.score(X_train, y_train)
test_acc = best_model_instance.score(X_test, y_test)

# Save evaluation report
report = {
    "model_accuracies": results,
    "best_model": best_model,
    "best_accuracy": best_accuracy,
    "confusion_matrix": conf_matrix.tolist(),
    "classification_report": class_report,
    "cross_validation_scores": cross_val_scores.tolist(),
    "mean_cross_validation_accuracy": mean_cv_accuracy,
    "training_accuracy": train_acc,
    "test_accuracy": test_acc
}
with open("model_report.json", "w") as f:
    json.dump(report, f, indent=4)

# Display results
print("\nModel Accuracies:")
for model, acc in results.items():
    print(f"{model}: {acc:.2f}")

print(f"\nBest Model: {best_model} with Accuracy: {best_accuracy:.2f}")
