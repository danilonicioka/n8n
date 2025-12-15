# Use a lightweight Python base image
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file and install dependencies
# We use Gunicorn to serve the Flask app in production
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
COPY . .

# Create the directory for uploads
RUN mkdir -p static/uploads

# Expose the port Gunicorn will run on
EXPOSE 5000

# Command to run the application using Gunicorn (a production WSGI server)
# Use 4 workers and bind to all interfaces (0.0.0.0) on port 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]