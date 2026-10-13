import logging
import uuid
from typing import Dict, Any, List, Optional
from app.agents.state import AgentState
from app.agents.summary_agent import summary_agent_node
from app.agents.qa_agent import qa_agent_node
from app.agents.test_agent import mock_test_agent_node
from app.agents.evaluation_agent import evaluation_agent_node
from app.agents.performance_agent import performance_agent_node
from app.llm.provider import invoke_llm_json
from app.llm.prompts import COORDINATOR_SYSTEM_PROMPT

logger = logging.getLogger("app.agents.coordinator")

async def intent_detector_node(state: AgentState) -> Dict[str, Any]:
    """
    Coordinator Step 1: Detects student intent and builds execution workflow plan.
    """
    prompt = state.get("user_prompt", "")
    logger.info(f"Coordinator detecting intent for user prompt: '{prompt[:60]}...'")

    if state.get("evaluation_data") and state.get("evaluation_data", {}).get("test_id"):
        return {
            "detected_intent": "test_evaluation",
            "workflow_plan": [{"step_number": 1, "agent_name": "evaluation_agent", "action": "Evaluate test answers"}]
        }

    coordinator_input = f"""Analyze the student's request and choose the appropriate specialized agent.
Student Request: "{prompt}"
Current Document ID: {state.get('document_id') or 'None selected'}
Session ID: {state.get('session_id')}
"""

    routing_result = await invoke_llm_json(
        system_prompt=COORDINATOR_SYSTEM_PROMPT,
        user_prompt=coordinator_input
    )

    detected_intent = routing_result.get("detected_intent", "qa")
    workflow_plan = routing_result.get("workflow_plan", [])

    if not workflow_plan:
        prompt_lower = prompt.lower()
        if any(w in prompt_lower for w in ["summary", "summarize", "overview", "key points", "formulas", "definitions"]):
            detected_intent = "summary"
            agent_name = "summary_agent"
        elif any(w in prompt_lower for w in ["test", "quiz", "mcq", "exam", "questions", "practice"]):
            detected_intent = "mock_test"
            agent_name = "mock_test_agent"
        elif any(w in prompt_lower for w in ["weak", "mistake", "performance", "progress", "improve", "wrong"]):
            detected_intent = "performance_analysis"
            agent_name = "performance_agent"
        else:
            detected_intent = "qa"
            agent_name = "qa_agent"

        workflow_plan = [{
            "step_number": 1,
            "agent_name": agent_name,
            "action": f"Route to {agent_name}"
        }]

    prompt_lower = prompt.lower()
    if ("explain" in prompt_lower and ("test" in prompt_lower or "quiz" in prompt_lower or "question" in prompt_lower)) or \
       ("weak" in prompt_lower and ("test" in prompt_lower or "quiz" in prompt_lower)):
        detected_intent = "multi_step"
        workflow_plan = [
            {"step_number": 1, "agent_name": "performance_agent", "action": "Analyze weak topics and errors"},
            {"step_number": 2, "agent_name": "mock_test_agent", "action": "Generate targeted remedial test"}
        ]

    step_info = {
        "step_number": 1,
        "agent_name": "coordinator",
        "action": f"Detected intent: '{detected_intent}'. Routing to {len(workflow_plan)} workflow steps.",
        "status": "completed",
        "output_summary": routing_result.get("explanation", f"Intent recognized as {detected_intent}")
    }

    return {
        "detected_intent": detected_intent,
        "workflow_plan": workflow_plan,
        "current_step_index": 0,
        "executed_steps": [step_info]
    }


def route_by_intent(state: AgentState) -> str:
    intent = state.get("detected_intent", "qa")
    if intent == "summary":
        return "summary_node"
    elif intent == "mock_test":
        return "test_node"
    elif intent == "test_evaluation":
        return "evaluation_node"
    elif intent == "performance_analysis":
        return "performance_node"
    elif intent == "multi_step":
        return "performance_node"
    else:
        return "qa_node"


async def multi_step_router_node(state: AgentState) -> Dict[str, Any]:
    if state.get("detected_intent") == "multi_step":
        logger.info("Advancing multi-step workflow to Mock Test generation...")
        test_state_update = await mock_test_agent_node(state)
        combined_steps = state.get("executed_steps", []) + test_state_update.get("executed_steps", [])
        
        combined_output = f"""### 🎯 Personalized Diagnostic & Remedial Plan

{state.get('final_output', '')}

---

### 📝 Generated Remedial Test
A new targeted practice test has been generated based on your diagnostic results.
**Test Title**: {test_state_update.get('test_data', {}).get('title', 'Targeted Practice Quiz')}
**Questions**: {len(test_state_update.get('test_data', {}).get('questions', []))} questions configured.
"""
        return {
            "test_data": test_state_update.get("test_data"),
            "final_output": combined_output,
            "executed_steps": combined_steps,
            "follow_up_suggestions": ["Start the remedial practice test now", "Ask questions about the diagnosis"]
        }
    return {}


class CoordinatorAgent:
    """
    Main LangGraph Coordinator Agent orchestrating the student workflow.
    """
    def __init__(self):
        self.workflow = self._build_graph()

    def _build_graph(self):
        try:
            from langgraph.graph import StateGraph, END
            builder = StateGraph(AgentState)

            builder.add_node("intent_detector", intent_detector_node)
            builder.add_node("summary_node", summary_agent_node)
            builder.add_node("qa_node", qa_agent_node)
            builder.add_node("test_node", mock_test_agent_node)
            builder.add_node("evaluation_node", evaluation_agent_node)
            builder.add_node("performance_node", performance_agent_node)
            builder.add_node("multi_step_node", multi_step_router_node)

            builder.set_entry_point("intent_detector")

            builder.add_conditional_edges(
                "intent_detector",
                route_by_intent,
                {
                    "summary_node": "summary_node",
                    "qa_node": "qa_node",
                    "test_node": "test_node",
                    "evaluation_node": "evaluation_node",
                    "performance_node": "performance_node"
                }
            )

            builder.add_edge("performance_node", "multi_step_node")
            builder.add_edge("multi_step_node", END)

            builder.add_edge("summary_node", END)
            builder.add_edge("qa_node", END)
            builder.add_edge("test_node", END)
            builder.add_edge("evaluation_node", END)

            return builder.compile()
        except ImportError:
            logger.info("Using native state graph runner.")
            return None

    async def execute(
        self,
        user_prompt: str,
        user_id: str = "anonymous",
        document_id: Optional[str] = None,
        session_id: Optional[str] = None,
        evaluation_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes the coordinator workflow for a student request.
        """
        state: AgentState = {
            "user_id": user_id,
            "document_id": document_id,
            "session_id": session_id or str(uuid.uuid4()),
            "user_prompt": user_prompt,
            "detected_intent": "",
            "workflow_plan": [],
            "current_step_index": 0,
            "executed_steps": [],
            "context_chunks": [],
            "retrieved_text": "",
            "summary_data": None,
            "qa_data": None,
            "test_data": None,
            "evaluation_data": evaluation_data,
            "performance_data": None,
            "final_output": "",
            "follow_up_suggestions": [],
            "error": None
        }

        if self.workflow is not None:
            return await self.workflow.ainvoke(state)

        # Native runner execution
        intent_res = await intent_detector_node(state)
        state.update(intent_res)

        target_node = route_by_intent(state)
        if target_node == "summary_node":
            res = await summary_agent_node(state)
            state.update(res)
        elif target_node == "test_node":
            res = await mock_test_agent_node(state)
            state.update(res)
        elif target_node == "evaluation_node":
            res = await evaluation_agent_node(state)
            state.update(res)
        elif target_node == "performance_node":
            res = await performance_agent_node(state)
            state.update(res)
            if state.get("detected_intent") == "multi_step":
                multi_res = await multi_step_router_node(state)
                state.update(multi_res)
        else:
            res = await qa_agent_node(state)
            state.update(res)

        return state


_coordinator_instance = None

def get_coordinator_agent() -> CoordinatorAgent:
    global _coordinator_instance
    if _coordinator_instance is None:
        _coordinator_instance = CoordinatorAgent()
    return _coordinator_instance
