# FUETS - AI Course Advisor & RAG Platform

FUETS is an intelligent, RAG-powered Course Advisor application. It provides an interactive platform for students to explore courses, review professors, and interact with an AI assistant that is contextually aware of uploaded academic documents.

## Features

* **AI Chat Assistant (RAG):** Context-aware chat interface built with LangChain to answer student queries based on course documents.
* **Document Management:** Upload and manage course materials (PDFs, etc.) directly into the RAG pipeline using S3/Cloudflare R2 storage.
* **Course & Professor Catalog:** Browse courses, view professor details, and read/write reviews.
* **User Authentication:** Secure login and registration system with JWT authentication.
* **Interactive Dashboard:** Manage documents, view system statistics, and handle administrative tasks.

## Tech Stack

### Frontend
* **Framework:** Next.js 
* **State Management:** Zustand 
* **Data Fetching:** TanStack React Query with Orval (auto-generated API clients)

### Backend
* **Framework:** FastAPI (Python)
* **Database:** PostgreSQL (with SQLModel and Alembic for migrations)
* **AI & LLMs:** LangChain (Groq, Google GenAI, HuggingFace), FastEmbed
* **Storage:** Boto3 (S3/R2 integration)
* **Architecture:** Modular REST API

---

## 📂 Project Structure

```text
FUETS/
├── backend/                  # FastAPI Application
│   ├── migrations/           # Alembic database migrations
│   ├── src/
│   │   ├── api/v1/           # REST endpoints (chats, courses, users, documents, etc.)
│   │   ├── core/             # Core logic (LLM config, Vector DB, Security, Settings)
│   │   ├── models/           # SQLModel database schemas & Pydantic models
│   │   └── utils/            # Helper scripts (S3 client, web scraper, CSV to SQL)
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                 # Next.js Application
│   ├── src/
│   │   ├── api/              # Auto-generated API hooks (Orval) & Axios setup
│   │   ├── app/              # Next.js App Router (Chat, Dashboard, Login, Signup)
│   │   ├── components/       # Reusable UI elements (Chat pane, Data tables, Forms)
│   │   ├── lib/              # Utility functions
│   │   └── stores/           # Zustand global state (chatStore, documentStore)
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.yaml       # Multi-container orchestration
```
### 🌐 Live Demo
- Try it out here: https://fuets.vercel.app
  
## 🐳 Getting Started (Docker)

The easiest way to run the entire stack (Frontend, Backend, and Database) is using Docker Compose.
### 1. Prerequisites
- **NOTE:** IF YOU USE R2 or any S3 compatable object storage, This project expect you to put documents in `docs` bucket, and have `/documents/` prefix 
- Docker and Docker Compose installed.
- Git

### 2. Clone the Repository
```Bash
git clone [https://github.com/limlim12-blip/FUETS.git](https://github.com/limlim12-blip/FUETS.git)
cd FUETS
```

### 3. Environment Variables

Create a .env file in the root directory in the root directory(the same one with `backend/`, `frontend/`) follow the .example.env file.

### 4. Build and Start the Containers
```
docker-compose up --build
```
Once running, the services will be available at:
   - Frontend UI: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation (Swagger): http://localhost:8000/docs

### NOTE:
- if you want to have your own data of professors, docs and reviews, you could manualy run the files in `backend/src/utils/` in the following sequence:
```
cd backend/
python -m src.utils.scraper -> csv2sqp -> s3
 ```
(have brain and do in sequence, dont copy it with the arrow)
- It can have some issues with the naming of csv column between steps, Im sorry  
