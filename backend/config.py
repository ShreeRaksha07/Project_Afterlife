import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from backend/.env if it exists
backend_dir = Path(__file__).resolve().parent
dotenv_path = backend_dir / ".env"
load_dotenv(dotenv_path=dotenv_path)

# Groq API Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b").strip()

# GitHub Configuration (optional personal access token to avoid rate limits)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()

# Server Configuration
PORT = int(os.getenv("PORT", 5000))
DEBUG = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")
HOST = os.getenv("HOST", "0.0.0.0")
