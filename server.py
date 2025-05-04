from fastapi import FastAPI, Request, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx
from liteLLM import LiteLLM
import uvicorn
from typing import List, Optional

app = FastAPI(title="Web-based Chat Assistant")

# Initialize LLMs (assuming LiteLLM supports multiple models)
# For demonstration, we'll initialize a dictionary of models
models = {
    "model_a": LiteLLM(model_name="model_a"),
    "model_b": LiteLLM(model_name="model_b"),
    # Add more models as needed
}

class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class Conversation(BaseModel):
    messages: List[Message]
    model_name: Optional[str] = "model_a"  # default model

@app.post("/chat/")
async def chat_endpoint(conversation: Conversation):
    """
    Handle chat messages, maintain conversation context, and generate response from specified model.
    """
    model_name = conversation.model_name or "model_a"
    if model_name not in models:
        raise HTTPException(status_code=400, detail="Invalid model name.")
    model = models[model_name]
    try:
        # Prepare prompt from conversation messages
        prompt = ""
        for msg in conversation.messages:
            if msg.role == "user":
                prompt += f"User: {msg.content}\n"
            elif msg.role == "assistant":
                prompt += f"Assistant: {msg.content}\n"
        # Generate response
        response_text = await generate_response(model, prompt)
        return {"response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def generate_response(model: LiteLLM, prompt: str) -> str:
    """
    Generate a response from the model given a prompt.
    """
    try:
        response = await model.chat(prompt)
        return response
    except Exception as e:
        raise e

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    """
    Handle file uploads from users.
    """
    try:
        content = await file.read()
        # For demonstration, just return the size of the uploaded file
        return {"filename": file.filename, "size": len(content)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/compare/")
async def compare_models(conversation: Conversation):
    """
    Generate responses from multiple models for comparison.
    """
    responses = {}
    for model_name, model in models.items():
        try:
            prompt = ""
            for msg in conversation.messages:
                if msg.role == "user":
                    prompt += f"User: {msg.content}\n"
                elif msg.role == "assistant":
                    prompt += f"Assistant: {msg.content}\n"
            response_text = await generate_response(model, prompt)
            responses[model_name] = response_text
        except Exception as e:
            responses[model_name] = f"Error: {str(e)}"
    return responses

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000)