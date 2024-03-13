#!/bin/bash

echo "Activating virtual environment..."
source env/bin/activate

echo "Running Nitro..."
nitro &

echo "Starting Flask application..."
flask run &
