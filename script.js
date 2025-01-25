// script.js - Displaying chat message with new functionality
let chatHistory = [];

document.getElementById('submit-button').addEventListener('click', async () => {
    const userInput = document.getElementById('user-input').value.trim();
    
    if (!userInput) {
        alert('Please enter a query.');
        return;
    }

    showTypingIndicator();
    
    // Display user input
    chatHistory.push({ user: userInput, ai: null });
    renderChat();

    try {
        const aiResponse = await sendAIRequest(userInput);
        chatHistory[chatHistory.length - 1].ai = aiResponse;
    } catch (error) {
        chatHistory[chatHistory.length - 1].ai = `Error: ${error.message}`;
    }

    hideTypingIndicator();
    renderChat();
});

function showTypingIndicator() {
    document.getElementById("typing-indicator").style.display = "block";
}

function hideTypingIndicator() {
    document.getElementById("typing-indicator").style.display = "none";
}

function renderChat() {
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = '';
    chatHistory.forEach(item => {
        chatBox.innerHTML += `<div class="user-message">${item.user}</div>`;
        chatBox.innerHTML += `<div class="ai-message">${item.ai}</div>`;
    });
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendAIRequest(input) {
    const result = await chrome.runtime.sendMessage({ action: 'userInput', data: input });
    return result;
}

document.getElementById("clear-chat").addEventListener("click", function() {
    chatHistory = [];
    renderChat();
});
