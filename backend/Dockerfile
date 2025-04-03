# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONUNBUFFERED 1

# Set working directory
WORKDIR /app

# Install system dependencies for ffmpeg and other libraries
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install the Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . /app/

# Ensure the Google Cloud credntials are in place
COPY service_account.json /app/service_account.json

# Set the environment variables for Google Cloud Credentials
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/service_account.json

# Expose the port your app will run on
EXPOSE 8000

# Command to run the app
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]