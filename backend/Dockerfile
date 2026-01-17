FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose port (optional documentation)
EXPOSE 8000

# Use 0.0.0.0 to listen on all interfaces within the container
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
