#!/usr/bin/env python

import sys
import os
import subprocess

print("Python version:", sys.version)
print("Python executable:", sys.executable)
print("Current path:", os.getcwd())

try:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    print("Dependencies installed successfully!")
except Exception as e:
    print("Error installing dependencies:", e) 