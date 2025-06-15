# Use a slim Python 3.11 base image for a smaller footprint.
FROM python:3.13
WORKDIR /app

# Copy the requirements file first to leverage Docker's layer caching.
# This layer will only be rebuilt if requirements.txt changes.
COPY requirements.txt .

# Install the Python dependencies.
# --no-cache-dir reduces image size by not storing the pip cache.
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code.
COPY main.py .

# Expose port 8000 to allow traffic to the Uvicorn server inside the container.
EXPOSE 8000

# The command to run the application.
# uvicorn: The ASGI server.
# main:app: Tells uvicorn to look for the 'app' object in the 'main.py' file.
# --host 0.0.0.0: Makes the server accessible from outside the container.
# --port 8000: The port inside the container to run on.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
