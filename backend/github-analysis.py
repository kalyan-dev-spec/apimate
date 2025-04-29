from flask import Flask, request, jsonify, render_template
import requests
import base64
import json
import re
from flask_cors import CORS
from database_api import database_api, db 
from chat import chat_bp
from flask_session import Session
from flask_cors import CORS
import os
from database_api import APIRegistration

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://dev:dev@db:5432/api_registration")
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# ✅ Initialize SQLAlchemy with Flask App
db.init_app(app)

# ✅ Register Database API Routes
app.register_blueprint(database_api)

# ✅ Create Database Tables (if not created)
def seed_database_from_json(filename):
    json_file_path = os.path.join(os.path.dirname(__file__), filename)
    with open(json_file_path, "r") as file:
        data = json.load(file)
        for item in data:
            if not item or not isinstance(item, dict):
                print("⚠️ Skipping invalid item:", item)
                continue  # S
            keyword = "API"
            description=item.get("api_description", "")
            idx = description.find(keyword)
            if idx != -1:
                sliced = description[:idx + len(keyword)]
            else:
                sliced = ""
            entry = APIRegistration(
                api_name=sliced,
                description=description,
                architecture=item.get("architecture_techstack", ""),
                example_request=json.dumps(item.get("example_request", {})),
                example_response=json.dumps(item.get("example_response", {})),
                api_parameters=item.get("parameter_description", {}),
                developer=item.get("developer_name", ""),
                contact_email=item.get("developer_email", "")
            )
            db.session.add(entry)
        db.session.commit()
        print("✅ Seeded database from JSON file:", filename)

# ✅ Create tables and seed if empty
with app.app_context():
    db.create_all()
    seed_files=['api_dataset_seed.json', 'api_dataset_2_seed.json', 'api_dataset_3_seed.json', 'api_dataset_4_seed.json']
    if APIRegistration.query.first() is None:
        for file in seed_files:
                seed_database_from_json(file)

app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = False
Session(app)
# Enable CORS to allow credentials from your React frontend.
CORS(app, supports_credentials=True)

# Register the chat blueprint.
app.register_blueprint(chat_bp)

# GitHub API credentials
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")  # Replace with your GitHub PAT (or set to None for public repos)
OWNER =os.getenv("OWNER")  # GitHub repo owner
REPO = os.getenv("REPO")  # Repository name
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") # Replace with your OpenAI API key

# Headers (Authorization if using private repos)
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

# Dictionary to store analysis results
repo_files_analysis = {}

# Function to list all files in the repository recursively
def list_repo_files(owner, repo, path=""):
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    response = requests.get(url, headers=HEADERS)

    if response.status_code == 200:
        contents = response.json()
        files = []
        for item in contents:
            if item["type"] == "file":
                files.append(item["path"])
            elif item["type"] == "dir":
                files.extend(list_repo_files(owner, repo, item["path"]))  # Recursive call for subdirectories
        return files
    else:
        print(f"Error listing files: {response.json()}")
        return []

# Function to get file contents
def get_file_contents(owner, repo, file_path):
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{file_path}"
    print(url)
    response = requests.get(url, headers=HEADERS)

    if response.status_code == 200:
        file_data = response.json()
        file_content_encoded = file_data.get("content", "")
        return base64.b64decode(file_content_encoded).decode("utf-8")
    else:
        print(f"Error fetching file {file_path}: {response.json()}")
        return None
# Function to get author details (last commit author)
def get_file_author(owner, repo, file_path):
    url = f"https://api.github.com/repos/{owner}/{repo}/commits?path={file_path}&per_page=1"
    response = requests.get(url, headers=HEADERS)

    if response.status_code == 200:
        commits = response.json()
        if commits:
            latest_commit = commits[0]
            author = latest_commit.get("commit", {}).get("author", {})
            return {
                "author_name": author.get("name", "Unknown"),
                "author_email": author.get("email", "Unknown"),
                "commit_message": latest_commit.get("commit", {}).get("message", "No commit message"),
                "commit_date": author.get("date", "Unknown")
            }
    else:
        print(f"Error fetching author details for {file_path}: {response.json()}")
    return None
# Extract valid JSON from AI response
def extract_json(text):
    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group(0))  # Extract JSON content
    except json.JSONDecodeError:
        print("Error decoding JSON")
    return None

# Function to analyze file content using OpenAI API
def analyze_file_with_openai(file_name, file_content, openai_api_key=OPENAI_API_KEY):
    prompt = f"""
      You are an AI that analyzes source code files to determine:  
1. The programming language used.  
2. Whether the file contains an API implementation (Flask, Express, FastAPI, Django REST, etc.).  
3. If the API exists then give a breif description about the api.
4. If API code exists, extract:  
   - API name or framework used (Flask, FastAPI, Express, etc.).  
   - An example request template to call the API, formatted as:  
     ```json
     {{
       "method": "HTTP_METHOD",
       "url": "http://localhost:PORT/ENDPOINT",
       "params": {{"key": "value"}},  
       "headers": {{"key": "value"}},  
       "body": {{"key": "value"}}  
     }}
     ```
     (Include `params` for query parameters, `headers` if applicable, and `body` for POST/PUT requests. Leave unnecessary fields empty.)  

Return a **strictly valid JSON** response with this structure:  
```json
{{
  "language": "Programming Language",
  "contains_api": true/false,
  "api_name": "Framework or API Name (if applicable)",
  "api_description": "Brief description of the API (if applicable)",
  "api_request_template": {{  
    "method": "HTTP_METHOD",  
    "url": "http://localhost:PORT/ENDPOINT",  
    "params": {{"key": "value"}},  
    "headers": {{"key": "value"}},  
    "body": {{"key": "value"}}  
  }}
}}
Only return the JSON. Do not include any explanations or extra text.

Analyze the following file:{file_content}
"""
    OPENAI_HEADERS = {
    "Authorization": f"Bearer {openai_api_key}",
    "Content-Type": "application/json"
    }

    data = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are an AI code analyzer. Respond with JSON only."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=OPENAI_HEADERS, json=data)

    if response.status_code == 200:
        try:
            reply = response.json()["choices"][0]["message"]["content"]
            extracted_json = extract_json(reply)
            if extracted_json:
                return extracted_json
            else:
                print(f"Error parsing OpenAI response for {file_name}: Invalid JSON format")
                return None
        except Exception as e:
            print(f"Error parsing OpenAI response for {file_name}: {e}")
            return None
    else:
        print(f"Error fetching OpenAI response for {file_name}:", response.json())
        return None
def dummy_analysis():
    return {
        "api_description": "A simple weather API that retrieves current weather data based on a location query parameter.",
        "api_name": "Flask",
        "api_request_template": {
            "body": {},
            "headers": {},
            "method": "GET",
            "params": {
                "location": "city_name"
            },
            "url": "http://localhost:5000/weather"
        },
        "author_details": {
            "author_email": "khajifaizanali1999@gmail.com",
            "author_name": "khajifaizanali-dev",
            "commit_date": "2025-02-05T20:50:49Z",
            "commit_message": "Create weather-api-main.py"
        },
        "contains_api": True,
        "language": "Python"
    }
    

@app.route('/analyze', methods=['POST'])
def analyze_repository():
    data = request.json
    openai_api_key = data.get("openai_api_key")
    owner = data.get("owner")
    repo = data.get("repo")
    path = data.get("path")

    # if not openai_api_key:
    #     return jsonify({"error": "Missing OpenAI API key"}), 400
    
    repo_files_analysis = {}
    all_files = list_repo_files(owner, repo, path)
    for file_path in all_files:
        file_content = get_file_contents(owner, repo, file_path)
        author_details = get_file_author(owner, repo, file_path)
        if file_content:
            analysis_result = analyze_file_with_openai(file_path, file_content)
            # analysis_result = dummy_analysis()
            if analysis_result and analysis_result.get("contains_api")==True:
              analysis_result["author_details"] = author_details if author_details else {"author_name": "Unknown", "author_email": "Unknown"}
              repo_files_analysis[file_path] = analysis_result
    return jsonify(repo_files_analysis)


@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050)
