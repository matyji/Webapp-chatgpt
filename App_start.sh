#!/bin/bash

echo "Activating virtual environment..."
source env/bin/activate

echo "Running Nitro..."
./nitro/build/nitro &

echo "Starting Flask application..."
flask run &
