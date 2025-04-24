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
            text: `You are TrashCam, a specialized waste analysis assistant. Carefully analyze this waste/trash image and provide detailed, accurate information to help with proper disposal and potential recycling.

TASK: Analyze the waste material in the image with these specific parameters:

1. WASTE TYPE: Identify the primary material (plastic, paper, glass, metal, organic, electronic, hazardous, mixed) and be specific about subcategories when possible (e.g., PET plastic, newspaper, food waste)

2. QUALITY ASSESSMENT: Evaluate the condition on a scale:
   - Poor: Heavily damaged, contaminated, or degraded
   - Fair: Somewhat damaged but recognizable
   - Good: Minor wear, mostly intact
   - Excellent: Clean, undamaged, well-preserved

3. HOME RESTORATION POTENTIAL: Determine if this item could be reused or upcycled at home (Yes/No)
   - If yes, briefly explain what could be made from it

4. PROPER DISPOSAL METHOD: 
   - IMPORTANT: Specify which COLOR-CODED bin is appropriate (blue, green, black, red, yellow, etc.)
   - Include any special handling instructions if applicable
   - Be precise about local recycling guidelines when possible

5. ENVIRONMENTAL IMPACT: Briefly note the environmental significance of proper disposal

FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:
Type: [primary material] - [specific subcategory if applicable]
Quality: [assessment with reasoning]
Home Restoration: [Yes/No] - [brief explanation if Yes]
Disposal: [COLOR] bin for [waste type] - [additional disposal instructions]
Environmental Impact: [brief note on environmental significance]
YouTube Query: [only if home restoration is possible - provide 3-5 word search term]`
          },
          {
            inlineData: {
              mimeType: "image/jpeg", 
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 800,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
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