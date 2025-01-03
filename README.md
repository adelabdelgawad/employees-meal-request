Here’s a detailed `README.md` tailored for your repository:

---

# Employees Meal Request Backend

This repository contains the backend for the Employees Meal Request system. It includes database models, migrations, and API logic. This guide will help you set up the database and run the backend on a new environment.

---

## Features

- **Automated Database Setup**: Automatically creates the database if it does not exist.
- **Database Schema Management**: Uses Alembic for migrations.
- **Environment Configuration**: Supports `.env` files for environment-specific settings.

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Python 3.10+**
- **MySQL Server**
- **Virtual Environment (optional but recommended)**

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your_username/employees-meal-request-backend.git
cd employees-meal-request-backend
```

### 2. Create and Activate a Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## Configuration

### Environment Variables

Create a `.env` file in the root of the repository with the following content:

```env
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_SERVER=localhost
DB_NAME=your_database_name
```

Replace `your_database_user`, `your_database_password`, and `your_database_name` with your MySQL credentials and desired database name.

---

## Database Setup

To set up the database and apply migrations:

### 1. Run the Setup Script
Execute the `setup_database.py` script to create the database and apply migrations:
```bash
python setup_database.py
```

### 2. What the Script Does
- **Checks and Creates Database**: If the database does not exist, it creates it.
- **Applies Migrations**: Runs Alembic migrations to set up the schema.

---

## Development and Testing

### Running the Backend
Start the backend server after setting up the database:
```bash
python main.py
```

### Running Tests
(Include instructions if your repo has tests.)

---

## Troubleshooting

1. **Missing Dependencies**:
   Run the following to install missing packages:
   ```bash
   pip install -r requirements.txt
   ```

2. **Database Connection Issues**:
   Ensure your MySQL server is running and the credentials in `.env` are correct.

3. **Regenerating Migrations**:
   If you need to reset migrations:
   ```bash
   rm -rf alembic/versions/*
   alembic revision --autogenerate -m "Initial migration"
   alembic upgrade head
   ```

---

## Contribution Guidelines

- Fork the repository.
- Create a new feature branch (`feature/your-feature`).
- Commit and push your changes.
- Open a pull request.

---

## License

This project is licensed under the MIT License. See `LICENSE` for details.

---

Let me know if you need help setting up additional details for the README!
