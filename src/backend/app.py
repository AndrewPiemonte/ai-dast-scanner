import asyncio
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


app = FastAPI()

# Allow all origins for now for local testing (prevents CORS errors)
# TODO: Review and update origins once we are ready to deploy
origins = [
    "http://localhost:3000",  # Frontend local testing
    "http://localhost:8000",  # FastAPI local testing
    "http://localhost",  # Default http
    "https://localhost",  # Default https
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: Review and update origins once we are ready to deploy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware to handle long-running requests
# This is needed since our scans can take a long time to complete
class TimeoutMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await asyncio.wait_for(call_next(request), timeout=1800)
            return response
        except asyncio.TimeoutError:
            return Response(
                content=json.dumps({
                    "detail": "Request timeout exceeded"
                }),
                status_code=504,
                media_type="application/json"
            )

app.add_middleware(TimeoutMiddleware)