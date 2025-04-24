from flask import Flask, render_template, request, jsonify
import os
import requests
import base64
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Set your Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in the .env file.")

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"

# Function to send image to Gemini API
def analyze_waste_image(image_path):
    with open(image_path, "rb") as image_file:
        image_base64 = base64.b64encode(image_file.read()).decode('utf-8')

    prompt_text = """Analyze this waste/trash image and provide the following information in a structured format:
1. Waste classification (e.g., plastic, paper, organic, electronic, hazardous)
2. Quality assessment (poor, fair, good, excellent)
3. Home restoration possibility (yes/no)
4. Proper disposal method (IMPORTANT: specify which COLOR-CODED trash can to use - blue, green, black, red, yellow, etc.)
5. If home recyclable, suggest a short search query for YouTube tutorials

Format your response as follows:
Type: [waste type]
Quality: [quality assessment]
Home Restoration: [yes/no]
Disposal: [specific color] bin for [waste type] - e.g., "Blue bin for recyclables" or "Green bin for organic waste"
YouTube Query: [only if home restoration is possible]"""

    payload = {
        "contents": [{
            "parts": [
                {"text": prompt_text},
                {"inlineData": {"mimeType": "image/jpeg", "data": image_base64}}
            ]
        }]
    }

    headers = {"Content-Type": "application/json"}

    response = requests.post(f"{GEMINI_API_URL}?key={GEMINI_API_KEY}", json=payload, headers=headers)

    if response.status_code == 200:
        api_result = response.json()
        # Check for errors within the Gemini response structure itself
        if "error" in api_result:
             return {
                 "error": f"Gemini API Error: {api_result['error'].get('message', 'Unknown error')}",
                 "status_code": api_result['error'].get('code', response.status_code)
             }
        return api_result
    else:
        # Try to parse JSON error from response body
        try:
            error_details = response.json()
            error_message = error_details.get("error", {}).get("message", response.text)
        except requests.exceptions.JSONDecodeError:
            error_message = response.text

        return {
            "error": "Failed to get valid response from Gemini API",
            "status_code": response.status_code,
            "details": error_message
        }

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)

        try:
            result = analyze_waste_image(file_path)

            if "error" in result:
                return jsonify(result), result.get("status_code", 500)

            message = "Could not analyze waste from response."
            if "candidates" in result and isinstance(result["candidates"], list) and result["candidates"]:
                first_candidate = result["candidates"][0]
                if "content" in first_candidate and "parts" in first_candidate["content"] and isinstance(first_candidate["content"]["parts"], list) and first_candidate["content"]["parts"]:
                    first_part = first_candidate["content"]["parts"][0]
                    if "text" in first_part:
                        message = first_part["text"]

            return jsonify({"message": message}), 200

        except Exception as e:
            app.logger.error(f"Error during prediction: {e}")
            return jsonify({"error": "An internal error occurred"}), 500
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)

    return jsonify({"error": "Invalid file"}), 400

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
