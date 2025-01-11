from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import data, request, request_lines, report
from dotenv import load_dotenv
from src.startup import lifespan
import logging
from middleware import TokenRenewalMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] | [%(funcName)s]: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()


# Initialize FastAPI app with custom lifespan
app = FastAPI(lifespan=lifespan)


# Configure CORS middleware
# Middleware for CORS and debugging
origins = [
    "http://localhost:3000",  # Frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Explicitly specify allowed origins
    allow_credentials=True,  # Allow cookies and credentials
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

app.add_middleware(TokenRenewalMiddleware)

# Include additional routers
app.include_router(data.router, tags=["Data"])
app.include_router(request.router, tags=["Request"])
app.include_router(request_lines.router, tags=["Request"])
app.include_router(report.router, tags=["Report"])
