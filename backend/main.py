from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from backend.agent import EcoSortAgent

app = FastAPI()

# Allow the frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create one EcoSort agent
agent = EcoSortAgent()

@app.get("/")
def root():
    return {"message": "EcoSort backend is running."}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    
    # Read uploaded image
    image_bytes = await file.read()

    # Get MIME type
    mime_type = file.content_type

    # Make sure we received a valid MIME type
    if not mime_type:
        return {
            "error": "Could not determine image type."
        }

    # Await the asynchronous image analysis
    result_dict = await agent.analyze_image(
        image_bytes,
        mime_type
    )

    # Return the dictionary directly so the frontend gets the JSON structure it expects
    return result_dict