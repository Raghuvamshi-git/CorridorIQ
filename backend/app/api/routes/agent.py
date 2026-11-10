from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas.transit_schema import AgentChatRequest, AgentChatResponse
from backend.app.agent.gemini_agent import agent_instance

router = APIRouter(prefix="/agent", tags=["AI Operations Agent"])

@router.post("/chat", response_model=AgentChatResponse)
def chat_with_agent(payload: AgentChatRequest, db: Session = Depends(get_db)):
    """Receives operator queries, executes backend analytical tools, and returns evidence-backed recommendations."""
    return agent_instance.run(
        message=payload.message,
        db=db,
        conversation_history=payload.conversation_history
    )

