import os
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool, text, create_engine
from alembic import context
from sqlmodel import SQLModel
from dotenv import load_dotenv

# Import all models here
from db.models import (
    Role,
    HMISSecurityUser,
    Department,
    Employee,
    MealRequestStatus,
    MealType,
    Account,
    RolePermission,
    EmployeeShift,
    MealRequest,
    MealRequestLine,
    LogPermission,
    LogMealRequestLine,
    LogTraffic,
    Email,
    EmailRole,
)

# Load environment variables from .env file
load_dotenv()

# Alembic Config object
config = context.config

# Read database settings from the environment variables
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_SERVER = os.getenv("DB_SERVER")
DB_NAME = os.getenv("DB_NAME")

# Database connection strings
BASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}"
DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{DB_NAME}?charset=utf8mb4"
)

# Update alembic configuration
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set target metadata for autogenerate
target_metadata = SQLModel.metadata


# Check if the database exists and create it if necessary
def ensure_database_exists():
    engine = create_engine(BASE_URL)
    with engine.connect() as connection:
        result = connection.execute(
            text(
                f"SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '{DB_NAME}'"
            )
        )
        if not result.scalar():
            connection.execute(
                text(
                    f"CREATE DATABASE {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
                )
            )
            print(f"Database '{DB_NAME}' created successfully.")


# Ensure the database exists
ensure_database_exists()


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
