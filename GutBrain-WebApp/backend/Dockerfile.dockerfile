# backend/Dockerfile

# 1. Use an official Python runtime as a parent image
FROM python:3.11-slim

# 2. Set workdir
WORKDIR /app

# 3. Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
  && rm -rf /var/lib/apt/lists/*

# 4. Copy requirements and install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of the Django project
COPY . .

# 6. Expose Django port
EXPOSE 8000

# 7. Run migrations and start server
#    In production you'd use Gunicorn / UWSGI instead of runserver
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
