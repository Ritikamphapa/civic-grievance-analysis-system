# ---- Civic Grievance Analysis System : Backend Dockerfile ----
FROM python:3.12-slim

WORKDIR /app

# System deps kept minimal to keep the image small and the Cloud Run
# cold-start time low.
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# TextBlob needs NLTK corpora at runtime; download them at build time so the
# container doesn't need internet access when it starts.
RUN python -m textblob.download_corpora

COPY . .

# Cloud Run injects the PORT environment variable; default to 8080 locally.
ENV PORT=8080
EXPOSE 8080

CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
