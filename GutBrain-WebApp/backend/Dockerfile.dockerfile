# backend/Dockerfile

# 1. Use an official Python runtime as a parent image
FROM python:3.11-slim

# 2. Force Python to run in unbuffered mode (so print/logs appear immediately)
ENV PYTHONUNBUFFERED=1

# 3. Set workdir
WORKDIR /app

# 4. Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
  && rm -rf /var/lib/apt/lists/*

# 5. Copy requirements and install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy the rest of the Django project
COPY . .

# 7. Expose Django port
EXPOSE 8000

# 8. Run migrations and start server
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
