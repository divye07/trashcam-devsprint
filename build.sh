#!/bin/bash

# Exit on error
set -e

# Install Python dependencies
echo "Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

# Create a _redirects file for Netlify
echo "Creating Netlify _redirects file..."
echo "/* /templates/index.html 200" > _redirects

echo "Build completed successfully!" 
