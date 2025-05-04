import httpx
from typing import Dict, Any, Optional

class ChatAssistantClient:
    """
    A client to interact with the backend API for the web-based Chat Assistant.
    """

    def __init__(self, base_url: str):
        """
        Initialize the client with the base URL of the backend API.
        """
        self.base_url = base_url.rstrip('/')

    async def send_message(self, message: str, conversation_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Send a message to the chat API and receive a response.

        Args:
            message (str): The user's message.
            conversation_id (Optional[str]): The ID of the ongoing conversation, if any.

        Returns:
            Dict[str, Any]: The response from the API containing the assistant's reply.
        """
        url = f"{self.base_url}/chat"
        payload = {
            "message": message,
            "conversation_id": conversation_id
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            print(f"HTTP error occurred: {e}")
            return {"error": str(e)}
        except Exception as e:
            print(f"Unexpected error: {e}")
            return {"error": str(e)}

    async def upload_file(self, file_path: str) -> Dict[str, Any]:
        """
        Upload a file to the backend.

        Args:
            file_path (str): Path to the file to upload.

        Returns:
            Dict[str, Any]: The server's response after uploading.
        """
        url = f"{self.base_url}/upload"
        try:
            with open(file_path, 'rb') as f:
                files = {'file': (file_path, f)}
                async with httpx.AsyncClient() as client:
                    response = await client.post(url, files=files)
                    response.raise_for_status()
                    return response.json()
        except FileNotFoundError:
            print(f"File not found: {file_path}")
            return {"error": "File not found"}
        except httpx.HTTPError as e:
            print(f"HTTP error occurred: {e}")
            return {"error": str(e)}
        except Exception as e:
            print(f"Unexpected error: {e}")
            return {"error": str(e)}

    async def compare_models(self, prompt: str, model_ids: list) -> Dict[str, Any]:
        """
        Request comparison of responses from different models.

        Args:
            prompt (str): The prompt to send to models.
            model_ids (list): List of model identifiers to compare.

        Returns:
            Dict[str, Any]: The comparison results.
        """
        url = f"{self.base_url}/compare"
        payload = {
            "prompt": prompt,
            "model_ids": model_ids
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            print(f"HTTP error occurred: {e}")
            return {"error": str(e)}
        except Exception as e:
            print(f"Unexpected error: {e}")
            return {"error": str(e)}

# Example usage:
# import asyncio
# client = ChatAssistantClient("https://your-backend-url.com")
# asyncio.run(client.send_message("Hello!"))