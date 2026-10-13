from typing import TypedDict, List, Dict, Any, Optional, Union

class AgentState(TypedDict):
    # Session & Student context
    user_id: str
    document_id: Optional[str]
    session_id: str
    user_prompt: str
    
    # Intent and workflow planning
    detected_intent: str # summary, qa, mock_test, test_evaluation, performance_analysis, multi_step
    workflow_plan: List[Dict[str, Any]]
    current_step_index: int
    executed_steps: List[Dict[str, Any]]

    # Retrieval & intermediate data
    context_chunks: List[Dict[str, Any]]
    retrieved_text: str
    
    # Specialized agent payloads
    summary_data: Optional[Dict[str, Any]]
    qa_data: Optional[Dict[str, Any]]
    test_data: Optional[Dict[str, Any]]
    evaluation_data: Optional[Dict[str, Any]]
    performance_data: Optional[Dict[str, Any]]

    # Final response
    final_output: Union[Dict[str, Any], str]
    follow_up_suggestions: List[str]
    error: Optional[str]
