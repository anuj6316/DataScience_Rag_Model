FROM python:3.12-slim

WORKDIR /app

# COPYING REQUIREMENTS FILE
COPY requirements.txt /app

RUN pip install --no-cache-dir -r requirements.txt && \
    python -m pip install --upgrade pip

# COPY THE CODE
COPY . /app

EXPOSE 8000

CMD ["uvicorn", "backend.core.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]