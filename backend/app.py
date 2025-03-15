import os
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, data, meal, report, setting
from routers.request import history
from routers.request import requests
from dotenv import load_dotenv
from services.startup import lifespan
import logging
from src.middleware import TokenRenewalMiddleware
from hris_db.database import haris_db_engine
import logfire

# Load environment variables from .env file
load_dotenv()


logfire_api_key = os.getenv("LOGFIRE_TOKEN")
logfire_env = os.getenv("LOGFIRE_ENV", "development")

# Configure Logfire using the API key
if logfire_api_key:
    logfire.configure(token=logfire_api_key, environment=logfire_env)
else:
    raise ValueError("LOGFIRE_TOKEN is not set in the environment.")


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] | [%(funcName)s]: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# Initialize FastAPI app with custom lifespan
app = FastAPI(lifespan=lifespan)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )


# Configure CORS middleware
# Middleware for CORS and infoging
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


# Define lifespan event handler for FastAPI
async def lifespan(app: FastAPI):
    # Startup: could include additional initialization logic here
    yield
    # Shutdown: dispose the haris_db_engine to clean up pooled connections
    await haris_db_engine.dispose()


logfire.instrument_fastapi(app, capture_headers=True)

# Include additional routers
app.include_router(data.router, tags=["Data"])
app.include_router(requests.router, tags=["Request"])
app.include_router(report.router, tags=["Report"])
app.include_router(setting.router, tags=["Security Settings"])
app.include_router(auth.router, tags=["Authentication"])
app.include_router(history.router, tags=["Request"])
app.include_router(meal.router, tags=["Meals"])
