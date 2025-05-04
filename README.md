# README.md

# Web-Based Chat Assistant

This project implements a web-based Chat Assistant that provides a user-friendly interface for engaging in continuous conversations with various Large Language Models (LLMs). It features file upload capabilities, model response comparison, and is deployed on Render.com for easy access.

## Features

- Interactive chat interface with persistent conversations
- Support for uploading files to assist conversations
- Ability to compare responses from different LLMs
- Modular and scalable architecture
- Deployment-ready on Render.com

## Technologies Used

- FastAPI for the backend API
- Uvicorn as the ASGI server
- LiteLLM for interacting with LLMs
- HTTPX for HTTP requests
- Starlette for web components
- Pydantic for data validation

## Files

- `front_end.js`: Front-end JavaScript for UI interactions
- `server.py`: Backend API implementation
- `README.md`: This documentation

## Setup Instructions

1. Clone the repository
2. Install dependencies:

```bash
pip install fastapi uvicorn liteLLM httpx starlette pydantic
```

3. Run the server:

```bash
uvicorn server:app --host 0.0.0.0 --port 8000
```

4. Access the application via your Render.com deployment URL

---

## `front_end.js`

```javascript
// front_end.js

/**
 * Front-end JavaScript to handle user interactions with the chat UI.
 * Assumes existence of HTML elements with specific IDs.
 */

const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const chatContainer = document.getElementById('chat-container');
const fileInput = document.getElementById('file-upload');
const compareButton = document.getElementById('compare-btn');

const API_URL = 'https://your-render-url.com/api/chat'; // Replace with your deployed API URL

/**
 * Append a message to the chat container.
 * @param {string} sender - 'user' or 'bot'
 * @param {string} message - Message text
 */
function appendMessage(sender, message) {
    const messageElem = document.createElement('div');
    messageElem.className = sender === 'user' ? 'user-message' : 'bot-message';
    messageElem.innerText = message;
    chatContainer.appendChild(messageElem);
}

/**
 * Handle form submission to send user message.
 * @param {Event} e 
 */
async function handleSendMessage(e) {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (!message) return;

    appendMessage('user', message);
    messageInput.value = '';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        appendMessage('bot', data.reply);
    } catch (error) {
        appendMessage('bot', 'Error: ' + error.message);
    }
}

/**
 * Handle file upload.
 */
async function handleFileUpload() {
    const files = fileInput.files;
    if (files.length === 0) return;

    const formData = new FormData();
    for (const file of files) {
        formData.append('files', file);
    }

    try {
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error('File upload failed');
        alert('Files uploaded successfully.');
    } catch (error) {
        alert('Error uploading files: ' + error.message);
    }
}

/**
 * Handle response comparison.
 */
async function handleCompareResponses() {
    try {
        const response = await fetch(`${API_URL}/compare`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Comparison request failed');
        const data = await response.json();
        appendMessage('bot', 'Model A Response: ' + data.responseA);
        appendMessage('bot', 'Model B Response: ' + data.responseB);
    } catch (error) {
        alert('Error comparing responses: ' + error.message);
    }
}

chatForm.addEventListener('submit', handleSendMessage);
document.getElementById('upload-btn').addEventListener('click', handleFileUpload);
compareButton.addEventListener('click', handleCompareResponses);
```

---

## `server.py`

```python
# server.py

from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import httpx
from liteLLM import LiteLLM

app = FastAPI()

# Initialize LLMs (assuming LiteLLM supports multiple models)
# For demonstration, we'll set up a simple model interface
llm_models = {
    "model_a": LiteLLM(model_name="model_a_name"),
    "model_b": LiteLLM(model_name="model_b_name"),
}

# Store uploaded files temporarily
uploaded_files: List[UploadFile] = []

class MessageRequest(BaseModel):
    message: str

class Response(BaseModel):
    reply: str

@app.post("/api/chat", response_model=Response)
async def chat_endpoint(request: MessageRequest):
    """
    Handle user chat messages and return LLM response.
    """
    user_message = request.message
    try:
        # For simplicity, using a default model
        llm = llm_models.get("model_a")
        if not llm:
            raise HTTPException(status_code=500, detail="LLM model not configured.")
        response_text = await llm.chat(user_message)
        return Response(reply=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    """
    Handle file uploads.
    """
    global uploaded_files
    uploaded_files = files
    # Process files as needed, e.g., save to disk or memory
    # For demonstration, just acknowledge receipt
    for file in files:
        try:
            content = await file.read()
            # Save or process the file content as needed
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing file {file.filename}: {str(e)}")
    return {"detail": "Files uploaded successfully."}

@app.post("/api/compare")
async def compare_models():
    """
    Generate responses from two models and compare.
    """
    test_prompt = "Compare responses for this prompt."
    try:
        response_a = await llm_models["model_a"].chat(test_prompt)
        response_b = await llm_models["model_b"].chat(test_prompt)
        return {
            "responseA": response_a,
            "responseB": response_b
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000)
```