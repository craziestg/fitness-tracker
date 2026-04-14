#!/bin/bash

# Install Python dependencies
cd /home/site/wwwroot
pip install --no-cache-dir -r requirements.txt

# Run FastAPI with Uvicorn on port 8000
exec gunicorn --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 main:app
