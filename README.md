# 🚀 APIMate: An Intelligent Platform for API Discovery and Management

APIMate is a cloud-deployable platform that enables intelligent discovery, registration, and understanding of APIs across an organization. By combining the power of Large Language Models (LLMs), code analysis, semantic search, and Retrieval-Augmented Generation (RAG), APIMate simplifies how developers explore and work with APIs — all through a user-friendly web interface.

---

## 🌟 Features

- 🔍 **Natural Language API Discovery**  
  Ask for what you need in plain English — APIMate finds the right APIs using semantic search powered by Pinecone.

- 🧠 **LLM-Powered API Understanding**  
  Automatically extract and summarize APIs from GitHub repos using GPT-based analysis.

- ✍️ **Manual API Registration**  
  Add APIs manually using a clean form for internal, private, or undocumented services.

- 🗃 **Dual Storage Architecture**  
  - PostgreSQL for structured metadata (endpoints, methods, etc.)  
  - Pinecone for semantic vector embeddings

- 💬 **Interactive RAG Chatbot**  
  Chat with your API catalog for fast, contextual insights into what each API does and how to use it.

- 📦 **Dockerized Deployment**  
  Each component runs in its own container, ensuring modularity and easy deployment.

---

## 🏗️ System Architecture Overview

![System Architecture](https://github.com/khajifaizanali-dev/apimate/blob/main/system-arch.png)

---

## 🚢 Deployment Architecture

- **Backend (APIMate Engine)** – Flask app for code parsing, registration, and RAG response generation  
- **Frontend** – React-based UI for user interaction  
- **PostgreSQL** – Stores structured API metadata  
- **Pinecone** – Semantic vector database for API embeddings

![Deployment Architecture](https://github.com/khajifaizanali-dev/apimate/blob/main/deploy-arch.png)

---

## ⚙️ Quick Start (Local Deployment)

> 💡 **Prerequisite**: Make sure [Docker](https://docs.docker.com/get-docker/) is installed on your machine.

### 1. Clone the repository

```bash
git clone https://github.com/khajifaizanali-dev/apimate.git
cd apimate
```
### 2. Create a `.env` file

Before running the application, create a `.env` file in the root directory and add the following environment variables using **your own API keys**:

```env
PINECONE_API_KEY=your_pinecone_api_key
OPENAI_API_KEY=your_openai_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name
GITHUB_TOKEN=your_github_token
```
⚠️ Important: Do not commit your .env file to version control. Add it to .gitignore to keep your credentials safe.

### 2. Start all services

```bash
docker-compose up
```
Once the containers are up and running, the app will be accessible at:

👉 http://localhost:3000

⸻

🧪 Test Data

To validate system performance, a suite of GPT-generated APIs across domains (weather, AI, logistics, e-commerce, etc.) was created and manually registered. These help simulate real-world conditions for retrieval, summarization, and search functionality.

⸻
⸻

## 🔗 Links

- 🔍 **Live Demo**: [http://18.118.208.242:5050](http://18.118.208.242:5050)

- 💻 **GitHub Repo**: [https://github.com/khajifaizanali-dev/apimate](https://github.com/khajifaizanali-dev/apimate)
  
⸻

📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

⸻

🙌 Contributions

Contributions, feedback, and suggestions are welcome!
Feel free to open issues or submit pull requests.
