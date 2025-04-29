from flask import Blueprint, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import pinecone
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import Pinecone
import json
import os

pinecone_api_key = os.getenv("PINECONE_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")
pinecone_index_name = os.getenv("PINECONE_INDEX_NAME")

# Initialize Pinecone and ensure the index exists.
pc = pinecone.Pinecone(api_key=pinecone_api_key)
index = pc.Index(pinecone_index_name)
embeddings = OpenAIEmbeddings(
    openai_api_key=openai_api_key,
    model="text-embedding-3-small"
)

# ✅ Create a Blueprint for database routes
database_api = Blueprint("database_api", __name__)

# ✅ Initialize SQLAlchemy (will be linked to the main app later)
db = SQLAlchemy()

class APIRegistration(db.Model):
    __tablename__ = 'api_registration'
    
    id = db.Column(db.Integer, primary_key=True)
    api_name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    example_request = db.Column(db.Text, nullable=False)
    example_response = db.Column(db.Text)  # ✅ New field
    architecture = db.Column(db.Text)
    developer = db.Column(db.String(255), nullable=False)
    contact_email = db.Column(db.String(255), nullable=False)
    api_parameters = db.Column(db.JSON)  # ✅ New JSON field

    def to_dict(self):
        return {
            "id": self.id,
            "api_name": self.api_name,
            "description": self.description,
            "example_request": self.example_request,
            "example_response": self.example_response,
            "architecture": self.architecture,
            "developer": self.developer,
            "contact_email": self.contact_email,
            "api_parameters": self.api_parameters or []
        }

# ✅ API Endpoint to Register an API
@database_api.route("/register_api", methods=["POST"])
def register_api():
    data = request.json

    # Validate required fields
    required_fields = ["api_name", "description", "example_request", "developer", "contact_email"]
    if any(field not in data or not data[field] for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    # Handle optional fields
    example_response = data.get("example_response", "")
    architecture = data.get("architecture", "")
    api_parameters = data.get("api_parameters", [])

    # Create API Registration entry
    new_api = APIRegistration(
        api_name=data["api_name"],
        description=data["description"],
        example_request=data["example_request"],
        example_response=example_response,
        architecture=architecture,
        developer=data["developer"],
        contact_email=data["contact_email"],
        api_parameters=api_parameters
    )

    try:
        db.session.add(new_api)
        db.session.commit()
        vectors = []
        doc= json.dumps(data)
        doc_embedding = embeddings.embed_query(doc)
        vectors.append((data["api_name"], doc_embedding, {"text": doc}))
        index.upsert(vectors=vectors)
        return jsonify({"message": "API registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@database_api.route("/get_apis", methods=["GET"])
def get_apis():
    apis = APIRegistration.query.all()
    api_list = [
        {
            "id": api.id,
            "api_name": api.api_name,
            "description": api.description,
            "developer": api.developer,
            "contact_email": api.contact_email,
            "example_request": api.example_request,  # ✅ Updated field name
            "example_response": api.example_response,  # ✅ New field
            "architecture": api.architecture,
            "api_parameters": api.api_parameters if api.api_parameters else [],  # ✅ New field with default empty list
        }
        for api in apis
    ]
    return jsonify(api_list), 200