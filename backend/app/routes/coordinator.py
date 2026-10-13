from fastapi import APIRouter, Depends
from app.services.auth_service import get_current_user
from app.database.models import CoordinatorWorkflowRequest, CoordinatorWorkflowResponse
from app.agents.coordinator import get_coordinator_agent

router = APIRouter()

@router.post("/execute", response_model=CoordinatorWorkflowResponse)
async def execute_coordinator_workflow(
    req: CoordinatorWorkflowRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id"))
    coordinator = get_coordinator_agent()
    result_state = await coordinator.execute(
        user_prompt=req.user_prompt,
        user_id=user_id,
        document_id=req.document_id,
        session_id=req.session_id
    )

    return {
        "detected_intent": result_state.get("detected_intent", "unknown"),
        "workflow_summary": f"Executed {len(result_state.get('executed_steps', []))} agent steps.",
        "executed_steps": result_state.get("executed_steps", []),
        "final_output": result_state.get("final_output", ""),
        "follow_up_suggestions": result_state.get("follow_up_suggestions", [])
    }
