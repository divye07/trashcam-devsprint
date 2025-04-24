const fetch = require('node-fetch');
const FormData = require('form-data');
const { Buffer } = require('buffer');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse the multipart form data (this is simplified - in production use a proper parser)
    const base64Image = JSON.parse(event.body).image;
    
    if (!base64Image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No image provided' })
      };
    }

    // Extract the base64 data (remove data:image/jpeg;base64, if present)
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    // Get API key from environment variables
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

    // Prepare the payload for Gemini API
    const payload = {
      contents: [{
        parts: [
          {
            text: `Analyze this waste/trash image and provide the following information in a structured format:
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
YouTube Query: [only if home restoration is possible]`
          },
          {
            inlineData: {
              mimeType: "image/jpeg", 
              data: base64Data
            }
          }
        ]
      }]
    };

    // Make the request to Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Process the response
    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: "Failed to get valid response from Gemini API",
          details: result.error?.message || "Unknown error"
        })
      };
    }

    // Extract the message from the Gemini response
    let message = "Could not analyze waste from response.";
    if (result.candidates && 
        result.candidates[0] && 
        result.candidates[0].content && 
        result.candidates[0].content.parts && 
        result.candidates[0].content.parts[0] && 
        result.candidates[0].content.parts[0].text) {
      message = result.candidates[0].content.parts[0].text;
    }

    // Return the analysis result
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Internal Server Error: ${error.message}` })
    };
  }
}; 