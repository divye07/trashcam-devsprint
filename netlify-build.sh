#!/bin/bash

# Exit on error
set -e

# Debug info
echo "Current directory: $(pwd)"
echo "Python version: $(python --version)"
echo "Python path: $(which python)"

# Try to use a specific Python version through pyenv if available
if command -v pyenv 1>/dev/null 2>&1; then
  echo "pyenv available, trying to install Python 3.9.7"
  pyenv install -s 3.9.7
  pyenv local 3.9.7
  echo "Python version after pyenv: $(python --version)"
fi

# Install Python dependencies
echo "Installing Python dependencies..."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo "Build completed successfully!" 