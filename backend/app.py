"""
Simplified backend application for TechSolutions website
Only handles the Gemini AI chatbot - no Google Sheets integration
"""

import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Initialize the Flask application
app = Flask(__name__, static_folder='../dist', static_url_path='')
CORS(app)  # Enable CORS for all routes

# Configure the Gemini API
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize the Gemini model
model = genai.GenerativeModel('gemini-1.5-flash')

# Chat history storage (in-memory for demonstration purposes)
chat_sessions = {}

# System prompt with company information for the chatbot
SYSTEM_PROMPT = """
You are an AI assistant for TechSolutions, a software development company that specializes in custom software solutions, 
mobile app development, cloud services, and AI integrations. Your role is to help website visitors by answering questions 
about our services, pricing, careers, and general information about the company.

Here are some key details about TechSolutions:

1. Services: We offer custom software development, mobile app development (iOS and Android), web application development, 
   cloud solutions, AI and machine learning integration, DevOps services, and IT consulting.

2. Company: Founded in 2010, we have over 200 employees across five offices globally. We've worked with clients 
   in industries including healthcare, finance, retail, education, and manufacturing.

3. Pricing: Our software development starts at $5,999 for basic projects, with business packages from $12,999, 
   and enterprise solutions with custom pricing. Mobile app development starts at $8,999.

4. Expertise: We specialize in technologies including JavaScript/TypeScript, React, Angular, Python, Node.js, 
   AWS/Azure/GCP, and mobile development frameworks.

5. Careers: We're always looking for talented developers, designers, product managers, and marketing specialists. 
   We offer competitive salaries, flexible work arrangements, healthcare benefits, and professional development.

Be friendly, helpful, and concise in your responses. If you don't know the answer to a specific question, 
offer to connect the visitor with a human representative through our contact form.
"""

@app.route('/')
def serve():
    """Serve the static frontend files"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Process chat messages with Gemini AI
    """
    try:
        data = request.json
        user_message = data.get('message', '')
        session_id = data.get('sessionId', 'default')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Get or create chat history for this session
        if session_id not in chat_sessions:
            # Initialize new chat session with system prompt
            chat_sessions[session_id] = model.start_chat(history=[
                {
                    "role": "user",
                    "parts": ["Your role is to be a helpful AI assistant for TechSolutions with the following information:"]
                },
                {
                    "role": "model",
                    "parts": ["I understand my role."]
                },
                {
                    "role": "user", 
                    "parts": [SYSTEM_PROMPT]
                },
                {
                    "role": "model",
                    "parts": ["I understand my role as an AI assistant for TechSolutions. I'll respond to queries about your software development services, company information, pricing, and career opportunities based on the information provided. I'll be friendly, helpful, and concise, and will offer to connect visitors with a human representative for questions I cannot answer."]
                }
            ])
        
        # Get the chat session
        chat = chat_sessions[session_id]
        
        # Generate response from Gemini
        response = chat.send_message(user_message)
        
        # Format and return the response
        return jsonify({
            'response': response.text,
            'sessionId': session_id
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset-chat', methods=['POST'])
def reset_chat():
    """
    Reset a chat session
    """
    try:
        data = request.json
        session_id = data.get('sessionId', 'default')
        
        # Clear the chat history for this session
        if session_id in chat_sessions:
            del chat_sessions[session_id]
        
        # Initialize new chat session with system prompt
        chat_sessions[session_id] = model.start_chat(history=[
            {
                "role": "user",
                "parts": ["Your role is to be a helpful AI assistant for TechSolutions with the following information:"]
            },
            {
                "role": "model",
                "parts": ["I understand my role."]
            },
            {
                "role": "user", 
                "parts": [SYSTEM_PROMPT]
            },
            {
                "role": "model",
                "parts": ["I understand my role as an AI assistant for TechSolutions. I'll respond to queries about your software development services, company information, pricing, and career opportunities based on the information provided. I'll be friendly, helpful, and concise, and will offer to connect visitors with a human representative for questions I cannot answer."]
            }
        ])
        
        return jsonify({
            'success': True,
            'message': 'Chat session reset successfully',
            'sessionId': session_id
        })
        
    except Exception as e:
        print(f"Error resetting chat: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Check if API key is set
    if not GOOGLE_API_KEY:
        print("WARNING: GOOGLE_API_KEY environment variable not set!")
        print("The chatbot will not function without a valid Gemini API key.")
        print("Please set this in your .env file or Vercel environment variables.")
    
    # For local development
    if os.environ.get("VERCEL_ENV") is None:
        app.run(debug=True, host='0.0.0.0', port=5000)
    # On Vercel, the application is run automatically
