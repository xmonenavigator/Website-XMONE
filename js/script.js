// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Chat Widget Functionality
    initChatWidget();
    
    // Add smooth scrolling for anchor links
    addSmoothScrolling();
    
    // Initialize form validation
    initFormValidation();
    
    // Initialize form submission handling (simplified - no Google Sheets)
    initFormSubmission();
    
    // Check login status
    checkLoginStatus();
});

// Backend API URL - only needed for chatbot
const API_URL = '/api';

// Generate a session ID for the chat
const SESSION_ID = generateSessionId();

// Chat Widget Functionality
function initChatWidget() {
    const chatToggleBtn = document.getElementById('chatToggleBtn');
    const chatContainer = document.getElementById('chatContainer');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatMessages = document.getElementById('chatMessages');
    const userMessageInput = document.getElementById('userMessage');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    
    if (!chatToggleBtn || !chatContainer) return;
    
    // Toggle chat widget visibility
    chatToggleBtn.addEventListener('click', function() {
        chatContainer.style.display = chatContainer.style.display === 'flex' ? 'none' : 'flex';
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
    
    function sendMessage() {
        const message = userMessageInput.value.trim();
        if (message) {
            // Add user message to chat
            addMessageToChat('user', message);
            
            // Clear input field
            userMessageInput.value = '';
            
            // Show typing indicator
            showTypingIndicator();
            
            // Call the backend API to get a response from Gemini
            callGeminiAPI(message)
                .then(response => {
                    // Remove typing indicator
                    removeTypingIndicator();
                    
                    // Add bot response to chat
                    addMessageToChat('bot', response);
                })
                .catch(error => {
                    console.error('Error communicating with Gemini API:', error);
                    
                    // Remove typing indicator
                    removeTypingIndicator();
                    
                    addMessageToChat('bot', 'Sorry, I encountered an error processing your request. Please try again later.');
                });
        }
    }
    
    function addMessageToChat(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = text;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Auto-scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
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
    
    function removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Function to call the Gemini API through our backend
    async function callGeminiAPI(message) {
        try {
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
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error:', error);
            return "Sorry, I'm having trouble connecting to my backend right now. Please try again later.";
        }
    }
}

// Add smooth scrolling for anchor links
function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Form validation
function initFormValidation() {
    // Get all forms with the 'needs-validation' class
    const forms = document.querySelectorAll('.needs-validation');
    
    // Loop over each form and prevent submission if fields are invalid
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        }, false);
    });
}

// Simplified form submission (no Google Sheets)
function initFormSubmission() {
    const forms = document.querySelectorAll('.google-sheets-form');
    
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }
            
            try {
                // Show loading state
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
                
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Reset submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                // Show success message
                const successAlert = document.createElement('div');
                successAlert.classList.add('alert', 'alert-success', 'mt-3');
                successAlert.textContent = 'Form submitted successfully!';
                
                // Reset the form
                form.reset();
                form.classList.remove('was-validated');
                
                // Append success message
                form.appendChild(successAlert);
                
                // Remove success message after 5 seconds
                setTimeout(() => {
                    successAlert.remove();
                }, 5000);
                
                // Close modal if the form is in a modal
                const modal = form.closest('.modal');
                if (modal) {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                }
                
            } catch (error) {
                console.error('Error:', error);
                
                // Show error message
                const errorAlert = document.createElement('div');
                errorAlert.classList.add('alert', 'alert-danger', 'mt-3');
                errorAlert.textContent = 'There was an error submitting the form. Please try again later.';
                
                form.appendChild(errorAlert);
                
                // Remove error message after 5 seconds
                setTimeout(() => {
                    errorAlert.remove();
                }, 5000);
            }
        });
    });
}

// Authentication Functions - Simplified with hardcoded credentials
function login(email, password) {
    // Check against hardcoded credentials
    if (email === 'ganesh@gmail.com' && password === 'sample1234') {
        // Store login state in sessionStorage
        sessionStorage.setItem('loggedIn', 'true');
        sessionStorage.setItem('userEmail', email);
        
        // Redirect to home page
        window.location.href = 'index.html';
        return true;
    }
    return false;
}

function register(name, email, password, confirmPassword) {
    // Validate inputs
    if (!name || !email || !password || password !== confirmPassword) {
        return false;
    }
    
    // In a real app, this would store the user in a database
    // For now, just simulate success
    
    // Store registration in sessionStorage temporarily
    sessionStorage.setItem('registeredName', name);
    sessionStorage.setItem('registeredEmail', email);
    
    // Redirect to login page
    window.location.href = 'login.html?registered=true';
    return true;
}

function checkLoginStatus() {
    const loggedIn = sessionStorage.getItem('loggedIn') === 'true';
    const userEmail = sessionStorage.getItem('userEmail');
    
    // Update UI based on login status
    const loginNavItem = document.querySelector('.nav-item a[href="login.html"]');
    if (loginNavItem && loggedIn && userEmail) {
        loginNavItem.textContent = userEmail;
        loginNavItem.href = '#';
        loginNavItem.classList.add('dropdown-toggle');
        loginNavItem.setAttribute('data-bs-toggle', 'dropdown');
        
        // Create dropdown menu
        const dropdownMenu = document.createElement('ul');
        dropdownMenu.classList.add('dropdown-menu', 'dropdown-menu-end', 'bg-dark');
        
        const profileItem = document.createElement('li');
        const profileLink = document.createElement('a');
        profileLink.classList.add('dropdown-item', 'text-light');
        profileLink.href = '#';
        profileLink.textContent = 'Profile';
        profileItem.appendChild(profileLink);
        
        const logoutItem = document.createElement('li');
        const logoutLink = document.createElement('a');
        logoutLink.classList.add('dropdown-item', 'text-light');
        logoutLink.href = '#';
        logoutLink.textContent = 'Logout';
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
        logoutItem.appendChild(logoutLink);
        
        dropdownMenu.appendChild(profileItem);
        dropdownMenu.appendChild(logoutItem);
        
        loginNavItem.parentNode.appendChild(dropdownMenu);
        loginNavItem.parentNode.classList.add('dropdown');
    }
}

function logout() {
    // Clear session storage
    sessionStorage.removeItem('loggedIn');
    sessionStorage.removeItem('userEmail');
    
    // Reload page
    window.location.reload();
}

// Check login status when the page loads
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    
    // Handle registered user notification
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
        const alertContainer = document.createElement('div');
        alertContainer.classList.add('alert', 'alert-success', 'alert-dismissible', 'fade', 'show', 'fixed-top', 'w-100', 'text-center');
        alertContainer.setAttribute('role', 'alert');
        alertContainer.innerHTML = `
            Registration successful! You can now log in.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(alertContainer);
        
        // Remove the 'registered' parameter from the URL
        window.history.replaceState({}, document.title, 'login.html');
    }
    
    // Initialize login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!loginForm.checkValidity()) {
                e.stopPropagation();
                loginForm.classList.add('was-validated');
                return;
            }
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Signing in...';
            
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Call the login function
            const success = login(email, password);
            
            // Reset submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            
            if (!success) {
                const loginError = document.getElementById('loginError');
                if (loginError) {
                    loginError.classList.remove('d-none');
                }
            }
        });
    }
    
    // Initialize register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!registerForm.checkValidity()) {
                e.stopPropagation();
                registerForm.classList.add('was-validated');
                return;
            }
            
            const name = document.getElementById('fullName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPass = document.getElementById('confirmPassword').value;
            
            // Check if passwords match
            if (password !== confirmPass) {
                const confirmPassword = document.getElementById('confirmPassword');
                confirmPassword.setCustomValidity('Passwords do not match');
                registerForm.classList.add('was-validated');
                return;
            }
            
            // Show loading state
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Signing up...';
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Call the register function
            const success = register(name, email, password, confirmPass);
            
            // Reset submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            
            if (!success) {
                const registerError = document.getElementById('registerError');
                if (registerError) {
                    registerError.classList.remove('d-none');
                }
            }
        });
    }
});

// Helper function to generate a session ID for the chat
function generateSessionId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
