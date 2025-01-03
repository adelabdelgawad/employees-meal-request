from .database import engine
from .models import SQLModel  # Import SQLModel base if you use SQLModel

metadata = SQLModel.metadata  # Ensure metadata is exposed
