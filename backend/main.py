from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, data, report, security
from routers.request.history import router as request_history_router
from routers.request.requests import router as request_requests_router
from dotenv import load_dotenv
from routers import request
from services.startup import lifespan
import logging
from src.middleware import TokenRenewalMiddleware


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

# Include additional routers
app.include_router(data.router, tags=["Data"])
app.include_router(request_requests_router, tags=["Request"])
app.include_router(report.router, tags=["Report"])
app.include_router(security.router, tags=["Security Settings"])
app.include_router(auth.router, tags=["Authentication"])
app.include_router(request_history_router, tags=["Request"])
