const API_URL = '/api';

// Generate a unique session ID for this chat session
const SESSION_ID = generateSessionId();

// Chat history to maintain context
let chatHistory = [];

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const userMessageInput = document.getElementById('userMessage');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const chatToggleBtn = document.getElementById('chatToggleBtn');
const chatContainer = document.getElementById('chatContainer');
const chatCloseBtn = document.getElementById('chatCloseBtn');

// Initialize the chat functionality
function initChat() {
    if (!chatToggleBtn || !chatContainer) return;
    
    // Toggle chat widget visibility
    chatToggleBtn.addEventListener('click', function() {
        chatContainer.style.display = chatContainer.style.display === 'flex' ? 'none' : 'flex';
        
        // If opening the chat and it's the first time, focus on the input
        if (chatContainer.style.display === 'flex' && chatHistory.length === 0) {
            userMessageInput.focus();
        }
    });
    
    // Close chat widget
    chatCloseBtn.addEventListener('click', function() {
        chatContainer.style.display = 'none';
    });
    
    // Send message when button is clicked
    sendMessageBtn.addEventListener('click', sendMessage);
    
    // Send message when Enter key is pressed
    userMessageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Function to send a message
async function sendMessage() {
    const message = userMessageInput.value.trim();
    if (!message) return;
    
    // Add user message to chat and history
    addMessageToChat('user', message);
    chatHistory.push({ role: 'user', content: message });
    
    // Clear input field
    userMessageInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Call the API
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                sessionId: SESSION_ID
            }),
        });
        
        // Remove typing indicator
        removeTypingIndicator();
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // Add bot response to chat and history
        addMessageToChat('bot', data.response);
        chatHistory.push({ role: 'assistant', content: data.response });
        
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator();
        
        // Show error message
        addMessageToChat('bot', "I'm sorry, but I'm having trouble connecting to my backend right now. Please try again later.");
    }
}

// Function to add a message to the chat UI
function addMessageToChat(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    
    // Process text for line breaks and links
    const formattedText = formatMessageText(text);
    messageContent.innerHTML = formattedText;
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Auto-scroll to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to format message text
function formatMessageText(text) {
    // Convert line breaks to <br>
    let formattedText = text.replace(/\n/g, '<br>');
    
    // Convert URLs to clickable links
    formattedText = formattedText.replace(
        /(https?:\/\/[^\s]+)/g, 
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    return formattedText;
}

// Function to show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot-message', 'typing-indicator');
    
    const typingContent = document.createElement('div');
    typingContent.classList.add('message-content');
    typingContent.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    
    typingDiv.appendChild(typingContent);
    chatMessages.appendChild(typingDiv);
    
    // Auto-scroll to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Function to reset the chat session
async function resetChat() {
    // Clear chat history
    chatHistory = [];
    
    // Clear chat messages
    while (chatMessages.firstChild) {
        chatMessages.removeChild(chatMessages.firstChild);
    }
    
    // Add initial welcome message
    addMessageToChat('bot', 'Hi there! I\'m your AI assistant. How can I help you today?');
    
    // Reset session on the backend
    try {
        await fetch(`${API_URL}/reset-chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: SESSION_ID
            }),
        });
    } catch (error) {
        console.error('Error resetting chat:', error);
    }
}

// Helper function to generate a session ID
function generateSessionId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Initialize the chat when the DOM is loaded
document.addEventListener('DOMContentLoaded', initChat);
