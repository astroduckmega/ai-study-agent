from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field

# ----------------- User Models -----------------
class UserBase(BaseModel):
    email: str
    full_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None


# ----------------- Document Models -----------------
class DocumentMetadata(BaseModel):
    filename: str
    file_size_bytes: int
    total_pages: int
    total_chunks: int
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    mime_type: str = "application/pdf"
    topics: List[str] = []

class DocumentResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_path: str
    metadata: DocumentMetadata
    status: str = "processed" # uploading, processing, processed, error
    error_message: Optional[str] = None
    created_at: datetime

class DocumentChunk(BaseModel):
    chunk_id: str
    document_id: str
    page_number: int
    content: str
    metadata: Dict[str, Any] = {}


# ----------------- Summary Models -----------------
class SummaryType:
    SHORT = "short"
    DETAILED = "detailed"
    CHAPTER_WISE = "chapter_wise"
    TOPIC_WISE = "topic_wise"
    EXAM_ORIENTED = "exam_oriented"
    DEFINITIONS = "definitions"
    KEY_POINTS = "key_points"
    FORMULAS = "formulas"

class SummaryRequest(BaseModel):
    document_id: str
    summary_type: str = "detailed" # short, detailed, chapter_wise, topic_wise, exam_oriented, definitions, key_points, formulas
    custom_instruction: Optional[str] = None
    chapter_or_topic: Optional[str] = None

class SummaryResponse(BaseModel):
    document_id: str
    summary_type: str
    title: str
    content: str
    key_takeaways: List[str] = []
    topics_covered: List[str] = []
    generated_at: datetime = Field(default_factory=datetime.utcnow)


# ----------------- Q&A / Chat Models -----------------
class Citation(BaseModel):
    document_id: str
    document_name: str
    page_number: int
    snippet: str
    relevance_score: Optional[float] = None

class ChatMessage(BaseModel):
    id: Optional[str] = None
    role: str # student, assistant, system
    content: str
    citations: List[Citation] = []
    agent_thoughts: Optional[List[str]] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    document_id: Optional[str] = None
    message: str
    session_id: Optional[str] = None
    chat_history: Optional[List[Dict[str, str]]] = None

class ChatResponse(BaseModel):
    session_id: str
    message: str
    citations: List[Citation] = []
    agent_steps: List[Dict[str, Any]] = []
    suggested_followups: List[str] = []


# ----------------- Mock Test Models -----------------
class QuestionType:
    MCQ = "mcq"
    TRUE_FALSE = "true_false"
    SHORT_ANSWER = "short_answer"
    MIXED = "mixed"

class QuestionDifficulty:
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class TestQuestion(BaseModel):
    question_id: str
    question_type: str # mcq, true_false, short_answer
    topic: str
    page_reference: Optional[int] = None
    question: str
    options: Optional[List[str]] = None # For MCQ and True/False
    correct_answer: str
    explanation: str
    difficulty: str = "medium"

class MockTestCreateRequest(BaseModel):
    document_id: str
    num_questions: int = 10 # 5, 10, 20, 50
    difficulty: str = "medium" # easy, medium, hard
    question_type: str = "mixed" # mcq, true_false, short_answer, mixed
    specific_topics: Optional[List[str]] = None
    time_limit_minutes: Optional[int] = 15

class PersonalizedTestRequest(BaseModel):
    document_id: Optional[str] = None
    based_on_weak_topics: bool = True
    difficulty: str = "hard"
    num_questions: int = 5

class MockTestResponse(BaseModel):
    test_id: str
    user_id: str
    document_id: str
    document_name: str
    title: str
    difficulty: str
    question_type: str
    questions: List[TestQuestion] # When served to student during test, correct_answer can be omitted or included
    total_questions: int
    time_limit_minutes: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ----------------- Test Submission & Evaluation Models -----------------
class StudentAnswer(BaseModel):
    question_id: str
    selected_answer: str

class TestSubmissionRequest(BaseModel):
    test_id: str
    document_id: str
    answers: List[StudentAnswer]
    time_taken_seconds: Optional[int] = 0

class QuestionEvaluationResult(BaseModel):
    question_id: str
    question: str
    topic: str
    student_answer: str
    correct_answer: str
    is_correct: bool
    score_awarded: float # 0.0 to 1.0
    explanation: str
    page_reference: Optional[int] = None

class TestEvaluationResponse(BaseModel):
    result_id: str
    test_id: str
    document_id: str
    document_name: str
    total_questions: int
    correct_count: int
    incorrect_count: int
    score_percentage: float
    accuracy: float
    time_taken_seconds: int
    questions_result: List[QuestionEvaluationResult]
    weak_topics_identified: List[str]
    strong_topics_identified: List[str]
    improvement_feedback: str
    submitted_at: datetime = Field(default_factory=datetime.utcnow)


# ----------------- Performance & Analytics Models -----------------
class WeakTopicRecord(BaseModel):
    topic: str
    document_id: str
    document_name: str
    total_questions_attempted: int
    incorrect_attempts: int
    error_rate: float # 0.0 - 1.0
    last_tested_at: datetime
    recommended_action: str

class PerformanceOverview(BaseModel):
    total_tests_taken: int
    average_score: float
    overall_accuracy: float
    total_questions_answered: int
    weak_topics: List[WeakTopicRecord]
    strong_topics: List[str]
    recent_tests: List[Dict[str, Any]]
    recommendations: List[str]
    study_activity_streak_days: int = 1


# ----------------- Agentic Coordinator Workflow Models -----------------
class AgentActionStep(BaseModel):
    step_number: int
    agent_name: str
    action: str
    status: str # started, completed, failed
    details: Optional[Dict[str, Any]] = None
    output_summary: Optional[str] = None

class CoordinatorWorkflowRequest(BaseModel):
    user_prompt: str
    document_id: Optional[str] = None
    session_id: Optional[str] = None

class CoordinatorWorkflowResponse(BaseModel):
    detected_intent: str
    workflow_summary: str
    executed_steps: List[AgentActionStep]
    final_output: Union[Dict[str, Any], str]
    follow_up_suggestions: List[str] = []
