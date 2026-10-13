Build a full-stack **Agentic AI Student PDF Study Assistant** that allows students to upload study materials in PDF format and interact with them as a personalized AI tutor.

The application should not be just a basic PDF chatbot. It must use an **agentic architecture** in which a Coordinator Agent understands the student's request, decides which action is required, invokes the appropriate tools or specialized agents, performs multi-step workflows when necessary, maintains session state, and uses previous performance to personalize future learning.

## 1. PDF Upload and RAG Pipeline

Allow the student to upload PDF files such as textbooks, lecture notes, study materials, and question banks.

Processing pipeline:

```text
PDF Upload
→ Text Extraction
→ Text Cleaning
→ Chunking
→ Embedding Generation
→ Vector Database
→ Retrieval
→ LLM Response
```

Requirements:

* Accept PDF files only.
* Validate file size and file type.
* Extract text using PyPDF/PyPDFLoader.
* Split documents into meaningful chunks.
* Generate embeddings.
* Store embeddings and metadata in Chroma or FAISS.
* Store page numbers and document information so the system can identify the source of an answer.
* Use RAG for PDF-grounded responses.
* Do not hallucinate information that is not supported by the uploaded material.
* When possible, show the relevant page number or source section.

## 2. Agentic Architecture

Create a **Coordinator Agent** as the main controller.

The Coordinator Agent should:

1. Understand the student's request.
2. Determine the student's intent.
3. Select the correct specialized agent or tool.
4. Execute one or multiple steps when required.
5. Maintain relevant state throughout the workflow.
6. Return the final response to the student.

Example:

```text
Student Request
      ↓
Coordinator Agent
      ↓
Intent Detection
      ↓
Tool / Agent Selection
      ↓
Execution
      ↓
Validation
      ↓
Final Response
```

The Coordinator Agent should support at least:

* Summary Agent
* Q&A/RAG Agent
* Mock Test Agent
* Test Evaluation Agent
* Performance Analysis Agent

## 3. Intent Routing

The Coordinator Agent must detect requests such as:

```text
"Summarize this chapter"
→ Summary Agent

"What is normalization?"
→ Q&A/RAG Agent

"Create a 20-question test"
→ Mock Test Agent

"Check my answers"
→ Test Evaluation Agent

"What topics am I weak in?"
→ Performance Analysis Agent

"Create another test based on my mistakes"
→ Multi-step personalized workflow
```

Do not hard-code every possible sentence. The system should use the LLM/agent to understand the student's intent.

## 4. Agent Tools

Create reusable tools/functions that agents can invoke.

Example tools:

```text
search_pdf()
retrieve_relevant_chunks()
generate_summary()
generate_mock_test()
evaluate_answers()
get_test_history()
analyze_weak_topics()
get_document_metadata()
save_test_result()
generate_personalized_test()
```

The agents should use tools instead of placing all logic in one large function.

## 5. Summary Agent

Allow the student to generate:

* Short Summary
* Detailed Summary
* Chapter-wise Summary
* Topic-wise Summary
* Exam-oriented Summary
* Important Definitions
* Key Points
* Important Formulas, when applicable

Example:

```text
Student:
Summarize Chapter 3 for exam preparation.

Coordinator Agent
→ Identify request as summary
→ Send request to Summary Agent
→ Retrieve Chapter 3 content
→ Generate exam-oriented summary
→ Return result
```

Use simple, student-friendly language.

## 6. Q&A/RAG Agent

Provide an interactive chat interface.

The student can ask questions such as:

```text
"What is normalization?"
"Explain deadlock in simple terms."
"What are the advantages of DBMS?"
"Which page discusses primary keys?"
```

Workflow:

```text
Question
→ Retrieve relevant PDF chunks
→ Generate grounded answer
→ Return answer
→ Include source/page information when available
```

The Q&A Agent should clearly state when the uploaded PDF does not contain enough information to answer a question instead of inventing an answer.

## 7. Mock Test Agent

Allow students to generate tests from the uploaded PDF.

Configurable options:

```text
Number of Questions:
5 / 10 / 20 / 50

Difficulty:
Easy / Medium / Hard

Question Type:
MCQ / True-False / Short Answer / Mixed
```

The generated questions must be based on the uploaded document.

For MCQs:

* Generate one correct answer.
* Generate plausible distractors.
* Store the correct answer separately.
* Generate an explanation for the answer.

## 8. Test Evaluation Agent

After the student completes a test:

```text
Student Answers
      ↓
Evaluation Agent
      ↓
Compare With Expected Answers
      ↓
Calculate Score
      ↓
Generate Explanations
      ↓
Identify Mistakes
```

Display:

```text
Score
Accuracy
Correct Answers
Incorrect Answers
Question-wise Results
Explanations
Weak Topics
```

Save the result in the database.

## 9. Personalized Learning / Performance Agent

Maintain student learning state across tests.

Store information such as:

```text
Test history
Scores
Incorrect questions
Correct questions
Topics
Weak topics
Strong topics
Difficulty history
```

The Performance Analysis Agent should analyze the history and identify areas where the student is making repeated mistakes.

Example:

```text
Test 1
Normalization → 2/5

Test 2
Normalization → 1/5

Performance Agent
→ Detect repeated weakness
→ Mark Normalization as a weak topic
```

## 10. Multi-Step Agentic Workflow

The system must support tasks that require multiple agent steps.

Example request:

> "Create another difficult test based on the topics I got wrong in my previous test."

The system should perform:

```text
Student Request
      ↓
Coordinator Agent
      ↓
Get Previous Test History
      ↓
Analyze Incorrect Answers
      ↓
Identify Weak Topics
      ↓
Retrieve Relevant PDF Content
      ↓
Generate Difficult Questions
      ↓
Validate Questions
      ↓
Return Personalized Test
```

Another example:

> "Explain the topics I got wrong and then give me 5 questions on them."

Workflow:

```text
Get Test History
→ Identify Incorrect Topics
→ Retrieve PDF Content
→ Generate Explanations
→ Generate 5 Questions
→ Return Interactive Test
```

This multi-step behavior is an important part of the agentic design.

## 11. State and Memory

Use state management so the agent remembers the current study session.

Track:

```text
Current PDF
Current chapter/topic
Current conversation
Current test
Student answers
Current score
Previous test results
Weak topics
Strong topics
```

Use LangGraph state/checkpointing or an equivalent approach.

Separate:

* **Short-term/session state** for the current interaction.
* **Persistent student data** for test history and performance.

## 12. Agent Validation

Add validation where appropriate.

For generated mock tests:

```text
Generate Questions
→ Validate Questions
→ Check That They Are Based On PDF
→ Check Answer Options
→ Check Correct Answer
→ Return Test
```

For PDF Q&A:

```text
Retrieve Content
→ Generate Answer
→ Check Grounding
→ Return Answer
```

Avoid generating unsupported facts.

## 13. User Interface

Build a modern, responsive student dashboard.

Pages/components:

### Login/Register

* Student authentication.
* Secure sessions.
* Password protection.

### Dashboard

Show:

```text
Uploaded PDFs
Recent Tests
Average Score
Accuracy
Weak Topics
Study Activity
```

### PDF Upload

* Drag-and-drop upload.
* Upload progress.
* Processing status.

### Summary

* Summary generation.
* Summary type selector.
* Topic/chapter navigation.

### Ask the PDF

* Chat interface.
* Conversation history.
* Source/page references.

### Mock Test

* Test configuration.
* Interactive questions.
* Timer option.
* Submit button.

### Results

* Score.
* Accuracy.
* Correct/incorrect questions.
* Explanations.
* Weak topics.

### Performance

Display:

* Test history.
* Score trends.
* Strong topics.
* Weak topics.
* Personalized recommendations based on performance data.

## 14. Technology Stack

### Frontend

* React
* Modern responsive UI
* Tailwind CSS

### Backend

* Python
* FastAPI

### Agent Framework

* LangGraph
* LangChain where useful

### LLM

Create a provider abstraction so the model can easily be switched.

Support configurable providers such as:

* Gemini
* OpenRouter
* Groq
* Ollama

The application must read API keys from environment variables.

### RAG

* PyPDF/PyPDFLoader
* Text splitters
* Embedding model
* Chroma or FAISS

### Database

Use MongoDB atlas:

* Users
* Documents
* Test history
* Scores
* Questions
* Answers
* Weak topics
* Study sessions

## 15. Suggested Project Architecture

Use a modular structure similar to:

```text
ai-study-agent/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── hooks/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── coordinator.py
│   │   │   ├── summary_agent.py
│   │   │   ├── qa_agent.py
│   │   │   ├── test_agent.py
│   │   │   ├── evaluation_agent.py
│   │   │   └── performance_agent.py
│   │   │
│   │   ├── tools/
│   │   │   ├── pdf_search.py
│   │   │   ├── summary_tools.py
│   │   │   ├── test_tools.py
│   │   │   └── analytics_tools.py
│   │   │
│   │   ├── rag/
│   │   │   ├── loader.py
│   │   │   ├── chunker.py
│   │   │   ├── embeddings.py
│   │   │   └── vector_store.py
│   │   │
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── database/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── README.md
└── docker-compose.yml
```

Keep the architecture modular and avoid putting the complete application into one file.

## 16. API Endpoints

Create appropriate FastAPI endpoints such as:

```text
POST /auth/register
POST /auth/login

POST /documents/upload
GET  /documents

POST /summary
POST /chat

POST /tests/generate
POST /tests/submit
GET  /tests/history

GET  /performance
GET  /performance/weak-topics

POST /tests/personalized
```

The frontend should communicate with the backend through these APIs.

## 17. Security and Reliability

* Never expose API keys in the frontend.
* Use environment variables.
* Validate uploads.
* Limit file size.
* Handle malformed PDFs.
* Handle LLM/API failures gracefully.
* Add retries where appropriate.
* Validate LLM-generated structured output with Pydantic.
* Prevent prompt injection from uploaded documents where practical.
* Ensure students only access their own documents and test history.

## 18. Final User Experience

The complete workflow should be:

```text
Student Registers/Login
        ↓
Uploads PDF
        ↓
PDF Processing + RAG Indexing
        ↓
Dashboard
        ↓
┌──────────────┬──────────────┬──────────────┐
│   Summary    │   Ask PDF    │  Mock Test   │
└──────────────┴──────────────┴──────────────┘
        ↓
Coordinator Agent
        ↓
Specialized Agent(s)
        ↓
Tools + RAG + Student Memory
        ↓
Final Result
        ↓
Save Learning Data
        ↓
Personalized Future Tests
```

## 19. Important Development Goal

Build this as a **real Agentic AI portfolio project**, not merely a PDF question-answering application.

The final implementation should demonstrate:

* RAG
* AI agents
* Agent routing
* Tool calling
* Multi-step workflows
* State management
* Persistent memory
* Structured outputs
* Personalized learning
* LLM integration
* Full-stack development

Generate the complete working project with:

* source code,
* folder structure,
* setup instructions,
* environment configuration,
* database integration,
* API documentation,
* frontend UI,
* backend implementation,
* agent workflows,
* RAG pipeline,
* and README.
