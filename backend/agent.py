import os
import json
from dotenv import load_dotenv
from pydantic import BaseModel, Field

from google import genai
from google.genai import types

# Load variables from .env
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

# Make sure the API key exists
if not api_key:
    raise ValueError("GEMINI_API_KEY was not found in the .env file.")


# Define the exact JSON structure the frontend expects
class DisposalResult(BaseModel):
    object_name: str = Field(description="The name of the main object in the image.")
    category: str = Field(description="The disposal category. Must be one of: RECYCLE, TRASH, COMPOST, E-WASTE, or SPECIAL.")
    material: str = Field(description="The primary material the object is made of.")
    confidence: float = Field(description="A confidence score between 0.0 and 1.0.")
    reason: str = Field(description="A short explanation of why it belongs in this category.")
    instructions: str = Field(description="Brief instructions on how to prepare it for disposal (e.g., 'Rinse out food residue').")
    special_notes: str | None = Field(default=None, description="Any special warnings, or null if none.")


class EcoSortAgent:

    def __init__(self):
        # Create the GEMINI client
        self.client = genai.Client(api_key=api_key)
        self.model = "gemini-3.5-flash"

    async def analyze_image(self, image_bytes: bytes, mime_type: str) -> dict:
        # Use the asynchronous client to prevent blocking the FastAPI server
        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=[
                "Analyze this image and provide disposal instructions according to standard US waste management guidelines.",
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            ],
            config=types.GenerateContentConfig(
                # Force Gemini to output JSON matching our Pydantic schema
                response_mime_type="application/json",
                response_schema=DisposalResult,
            )
        )

        # Parse the JSON string returned by Gemini into a Python dictionary
        return json.loads(response.text)


# Testing the analysis
if __name__ == "__main__":
    import asyncio

    async def test():
        image_path = "/Users/sid/Downloads/IMG_0333.JPG"

        if os.path.exists(image_path):
            with open(image_path, "rb") as image_file:
                image_bytes = image_file.read()

            agent = EcoSortAgent()
            result = await agent.analyze_image(image_bytes, "image/jpeg")
            print(json.dumps(result, indent=2))
        else:
            print(f"Please place an image at {image_path} to run the test.")

    asyncio.run(test())