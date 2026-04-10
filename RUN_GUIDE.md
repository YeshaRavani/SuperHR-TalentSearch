# Talent Search - Backend Run Guide

This guide describes how to setup and run the new FastAPI backend for the Talent Search platform.

## Prerequisites
- Python 3.10+
- `pip`

## Setup
1. **Install Dependencies**:
   ```bash
   pip install "fastapi" "uvicorn" "sqlalchemy" "pydantic" "passlib[bcrypt]" "python-multipart" "python-jose[cryptography]" "pytest" "httpx" "pydantic-settings"
   ```

2. **Initialize & Seed Database**:
   ```bash
   # Initialize schema
   python3 init_db.py
   # Seed demo data
   export PYTHONPATH=$PYTHONPATH:. && python3 seed_db.py
   ```

## Running the Backend
Start the FastAPI server using `uvicorn`:
```bash
uvicorn backend.main:app --reload
```

## API Documentation
Once running, you can access the interactive API documentation at:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## Running Tests
To verify the implementation:
```bash
pytest backend/tests/
```

## Running AI Evaluations
To run baseline AI endpoint evaluations locally:
```bash
python3 backend/evals/run_ai_evals.py
```

To enable LLM-as-a-judge scoring instead of the offline heuristic fallback:
```bash
export OPENAI_API_KEY=your_key_here
export OPENAI_MODEL=gpt-4.1-mini
python3 backend/evals/run_ai_evals.py
```

## Current Status
Refer to `IMPLEMENTATION_PROGRESS.md` for a detailed breakdown of endpoint status and frontend wiring.
