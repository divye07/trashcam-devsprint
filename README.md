# TrashCam - Smart Waste Analysis Application

![TrashCam Banner](static/trashcam-banner.png)

**TrashCam** is an AI-powered waste analysis application developed for **Google DevSprint 2k25** at **VIT AP University**. This Flask-based web application leverages Google's Gemini API to analyze images of waste, providing detailed classification, restoration potential assessment, and color-coded disposal recommendations.

## 🏆 Google DevSprint 2k25 Project

This project was created as part of Google DevSprint 2k25 hackathon at VIT AP University, focusing on sustainable technology solutions. TrashCam addresses the challenge of proper waste disposal and recycling by using AI to identify and provide actionable information about waste items.

## ✨ Features

- **Instant Waste Analysis**: Upload any waste/trash image for immediate classification
- **AI-Powered Recognition**: Utilizes Google's Gemini Vision API for accurate analysis
- **Comprehensive Waste Information**:
  - 🗑️ **Waste Type Classification**: Identifies materials (plastic, paper, organic, electronic, etc.)
  - ⭐ **Quality Assessment**: Evaluates item condition (poor, fair, good, excellent)
  - 🔄 **Restoration Potential**: Determines if the item can be restored at home
  - 🎨 **Color-Coded Disposal Guide**: Specifies which colored bin to use (blue, green, black, etc.)
  - 🎬 **DIY Restoration Resources**: Provides YouTube tutorial suggestions for restorable items
- **Responsive, Modern UI**: Clean interface that works on desktop and mobile devices
- **Real-Time Feedback**: Visual loading indicators and clear result formatting

## 🚀 Live Demo

Visit the live application: [TrashCam Demo](https://trashcam-devsprint.netlify.app/)

## 🔧 Technical Architecture

TrashCam is built using:
- **Backend**: Python Flask API server
- **Frontend**: HTML, JavaScript with Tailwind CSS
- **AI**: Google Gemini Vision API
- **Deployment**: Netlify for hosting

### Workflow

1. User uploads an image of waste through the web interface
2. The Flask backend processes the image and sends it to the Gemini Vision API
3. The carefully crafted prompt asks the AI to analyze the waste along specific parameters
4. The structured response is parsed and displayed in the UI with color-coded sections
5. If the item is restorable, a YouTube search link is generated

## 🛠️ Setup Instructions

### Local Development

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/trashcam.git
   cd trashcam
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the root directory with your Gemini API key:
   ```
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```

4. Run the application:
   ```
   python app.py
   ```

5. Open your browser and navigate to `http://localhost:5000`

### Netlify Deployment

To deploy this application on Netlify:

1. Fork this repository to your GitHub account
2. Connect your GitHub repository to Netlify
3. Set the following build settings:
   - Build command: `pip install -r requirements.txt`
   - Publish directory: `public`
4. Add your Gemini API key as an environment variable:
   - Key: `GEMINI_API_KEY`
   - Value: `your_gemini_api_key_here`

## 📱 How to Use

1. **Upload Waste Photo**: Click the green "Upload Waste Photo" button to select an image
2. **Preview**: Review the preview of your selected image
3. **Analyze**: Click the "Analyze Waste" button to process the image
4. **Results**: View the detailed analysis with color-coded sections:
   - **Waste Type**: Identifies the material category
   - **Quality**: Shows the condition with appropriate color indicators
   - **Home Restoration**: Indicates whether the item can be restored at home
   - **Disposal Method**: Highlights which colored bin to use with the bin color emphasized
5. **Restoration Resources**: If the item is restorable, click the YouTube link for DIY tutorials
6. **Reset**: Use the "Reset" button to analyze another waste item

## 📋 Requirements

- Python 3.7+
- Flask
- Requests
- Python-dotenv
- Google Gemini API key

## 🌟 Future Enhancements

- Mobile app version with camera integration
- Expanded database of waste types and disposal methods
- Community features to share restoration success stories
- Integration with local waste management schedules
- Gamification elements to encourage proper waste disposal


## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Google DevSprint 2k25 organizers at VIT AP University
- Google Gemini API team for providing the vision recognition capabilities
- All mentors and judges who provided feedback and guidance 
