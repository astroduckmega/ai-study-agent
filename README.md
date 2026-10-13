# 🎓 Agentic AI Student PDF Study Assistant

A full-stack **Agentic AI Student PDF Study Assistant** that transforms academic textbooks, lecture slides, and notes into an active, personalized AI tutor. 

Built with **FastAPI**, **LangGraph**, **ChromaDB / FAISS**, **MongoDB**, and **React + Tailwind CSS**.

---

## 🌟 Key Features

* **Multi-Agent Architecture (LangGraph)**:
  * **Coordinator Agent**: Understands student queries, classifies intent, selects specialized sub-agents, and manages multi-step workflows.
  * **Summary Agent**: Generates short, detailed, chapter-wise, exam-oriented summaries, definition glossaries, and formula sheets.
  * **Q&A / RAG Agent**: Answers questions grounded strictly in PDF content with exact **page citations** and hallucination prevention.
  * **Mock Test Agent**: Generates custom practice exams (MCQs, True/False, Short Answer) with plausible distractors and grading keys.
  * **Evaluation Agent**: Grades student answers, explains misconceptions, calculates scores, and identifies weak and strong topics.
  * **Performance & Remedial Learning Agent**: Tracks test history over time, detects repeated mistakes, and automatically generates 1-click targeted remedial quizzes.
* **Production RAG Pipeline**:
  * PDF extraction via PyPDF with text cleaning.
  * Context-aware chunking preserving page-number metadata.
  * Embedding indexing with ChromaDB.
  * Multi-step query retrieval with similarity filtering and grounding verification.
* **Modern Student Dashboard**:
  * Drag-and-drop PDF upload with progress tracking.
  * Interactive exam runner with countdown timer.
  * Deep diagnostic exam breakdown with question-by-question explanations.
  * Weak topic tracking with visual error-rate meters and mastery badges.
  * Dark-mode glassmorphic interface tailored for focused studying.

---

## 🏗️ System Architecture

```text
Student Request
      │
      ▼
┌──────────────────────────────────────────────┐
│           COORDINATOR AGENT                  │
│       (LangGraph StateGraph Router)          │
└──────────────────────┬───────────────────────┘
                       │
         ┌─────────────┼─────────────┬─────────────┐
         ▼             ▼             ▼             ▼
  ┌─────────────┐┌───────────┐┌─────────────┐┌───────────┐
  │Summary Agent││ Q&A / RAG ││Mock Test Agt││Performance│
  └──────┬──────┘└─────┬─────┘└──────┬──────┘└─────┬─────┘
         │             │             │             │
         └─────────────┼─────────────┴─────────────┘
                       ▼
         ┌───────────────────────────┐
         │     AGENT TOOLS & RAG     │
         │  (ChromaDB + PyPDF Chunks)│
         └─────────────┬─────────────┘
                       ▼
         ┌───────────────────────────┐
         │ PERSISTENT STUDENT MEMORY │
         │   (MongoDB Test History)  │
         └───────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** & **npm**
* (Optional) **MongoDB Atlas** or local MongoDB (the app includes an automatic in-memory fallback for zero-friction local testing)
* (Optional) **Google Gemini API Key** or **Groq API Key**

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env

# Run FastAPI backend server
python run.py
```
Backend will start on: **`http://localhost:8000`**  
Interactive API Docs (Swagger UI): **`http://localhost:8000/docs`**

---

### 2. Frontend Setup

```bash
cd frontend

# Install npm packages
npm install

# Start Vite dev server
npm run dev
```
Frontend will be available at: **`http://localhost:5173`**

---

### 3. Docker Compose (One-Command Deployment)

```bash
# Set your API key in .env or shell
export GOOGLE_API_KEY="your-gemini-api-key"

docker-compose up --build
```

---

## ⚙️ Environment Configuration (`backend/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DEFAULT_LLM_PROVIDER` | `gemini`, `groq`, `openrouter`, `ollama`, `openai` | `gemini` |
| `GOOGLE_API_KEY` | Google Gemini API Key | `""` |
| `GROQ_API_KEY` | Groq Cloud API Key | `""` |
| `MONGODB_URL` | MongoDB Connection URI | `mongodb://localhost:27017` |
| `MONGODB_DB_NAME` | Database Name | `ai_study_agent` |
| `CHROMA_PERSIST_DIR` | Directory for vector store embeddings | `./data/chromadb` |
| `SECRET_KEY` | JWT encryption secret key | Secret string |

---

## 📡 API Endpoints

### 🔐 Authentication
* `POST /api/v1/auth/register` - Create new student account.
* `POST /api/v1/auth/login` - Authenticate student and receive JWT token.
* `GET /api/v1/auth/me` - Get current student profile.

### 📄 Documents & RAG
* `POST /api/v1/documents/upload` - Upload PDF, extract text, chunk, and index embeddings.
* `GET /api/v1/documents` - List all uploaded study materials.
* `GET /api/v1/documents/{id}` - Get metadata for a specific document.
* `DELETE /api/v1/documents/{id}` - Delete document and associated vectors.

### 🤖 Agents & Workflows
* `POST /api/v1/summary/generate` - Generate short, detailed, exam-oriented, or formula summaries.
* `POST /api/v1/chat/message` - Grounded Ask-the-PDF RAG chat with page citations and step reasoning.
* `POST /api/v1/tests/generate` - Create custom mock test (MCQs, True/False, Mixed).
* `POST /api/v1/tests/submit` - Submit answers and receive score, accuracy, and weak topic diagnostics.
* `GET /api/v1/tests/history` - Retrieve student's chronological exam history.
* `POST /api/v1/tests/personalized` - Generate adaptive remedial exam targeting diagnosed weak areas.
* `GET /api/v1/performance/overview` - Complete study analytics and score trajectory.
* `POST /api/v1/coordinator/execute` - Direct natural-language multi-step workflow orchestration.

---

## 👥 Default Demo Credentials
If testing without creating an account:
* **Email**: `student@demo.ai`
* **Password**: `password123`

---

## 📜 License
MIT License. Built as an Agentic AI Portfolio Project.
