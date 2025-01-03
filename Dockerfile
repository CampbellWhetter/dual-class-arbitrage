# Use an official Python image as the base
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install dependencies
RUN apt-get update && apt-get install -y gcc libpq-dev \
    && python -m ensurepip --upgrade \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y gcc libpq-dev \
    && apt-get autoremove -y \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy the application code
COPY . .

# Expose the application port
EXPOSE 8000

# Command to run the application
CMD ["gunicorn", "app:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]

# Health checks
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
    CMD curl -f http://localhost:8000/ || exit 1