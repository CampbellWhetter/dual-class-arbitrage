# Use an official Python 3.11 slim image as the base
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file into the container
COPY backend/requirements.txt .

# Install pip and other dependencies
RUN apt-get update && apt-get install -y gcc libpq-dev \
    && python -m ensurepip --upgrade \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy the application files into the container
COPY backend/ .

# Expose the application port
EXPOSE 8000

# Command to run the application
CMD ["gunicorn", "app:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]