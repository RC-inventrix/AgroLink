FROM python:3.11-slim
WORKDIR /app

# Create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model files and app code
COPY model.pkl standscaler.pkl minmaxscaler.pkl ./
COPY app.py .

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["python", "app.py"]
