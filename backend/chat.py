# chat_routes.py
from flask import Blueprint, request, jsonify, session
import openai
import pinecone
from langchain.embeddings import OpenAIEmbeddings
import os

chat_bp = Blueprint("chat", __name__)

# Configure API keys from environment variables.
openai.api_key = os.getenv("OPENAI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_INDEX_NAME")
client = openai.OpenAI(api_key=openai.api_key)

# Initialize Pinecone and ensure the index exists.
pc = pinecone.Pinecone(api_key=pinecone_api_key)
index = pc.Index("apimate")

# Initialize the embeddings (using LangChain).
embeddings = OpenAIEmbeddings(openai_api_key=openai.api_key, model="text-embedding-3-small")

def get_conversation_history():
    """Retrieve the conversation history from the session."""
    if "history" not in session:
        session["history"] = []
    return session["history"]

def update_conversation_history(role, message):
    """Append a new message to the conversation history."""
    history = get_conversation_history()
    history.append(f"{role}: {message}")
    session["history"] = history

def generate_response(query):
    """Generate a response using conversation history and retrieved document context."""
    # Get the current conversation history.
    history = get_conversation_history()
    
    # Generate an embedding for the query.
    query_embedding = embeddings.embed_query(query)
    
    # Retrieve the most relevant document(s) from Pinecone.
    query_response = index.query(vector=query_embedding, top_k=1, include_metadata=True)
    retrieved_texts = [match["metadata"]["text"] for match in query_response["matches"]]
    context = "\n".join(retrieved_texts)
    
    # Combine conversation history and retrieved context to build the prompt.
    conversation_context = "\n".join(history)
    prompt = f"""
The following is an ongoing conversation. Use the context from retrieved documents to answer the current query.

Conversation History:
{conversation_context}

Retrieved Context From Database:
{context}

Query:
{query}

Based on the above, provide an answer to the latest question.
    """
    
    # Call the ChatCompletion API.
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # or another model like "gpt-4" if available
        messages=[
            {"role": "system", "content": "You are a API assistant to help users better understand about the existing APIs in the repo."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500
    )

    answer = response.choices[0].message.content.strip()
    
    # Update conversation history with both query (and its context) and the bot answer.
    update_conversation_history("User", f"{query}\nRetrieved Context: {context}")
    update_conversation_history("Bot", answer)
    
    return answer

@chat_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Missing 'message' parameter"}), 400
    query = data["message"]
    
    answer = generate_response(query)
    # Return only the final answer to the frontend.
    return jsonify({"response": answer})