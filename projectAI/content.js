function createChatBox() {
    let chatBox = document.getElementById("ai-chat-box");
    if (!chatBox) {
        chatBox = document.createElement("div");
        chatBox.id = "ai-chat-box";
        chatBox.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 300px;
            height: 400px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            z-index: 10000;
        `;

        chatBox.innerHTML = `
            <div style="padding: 10px; background: #4CAF50; color: white; border-radius: 8px 8px 0 0;">
                AI Coding Assistant
            </div>
            <div id="response-container" style="flex: 1; overflow-y: auto; padding: 10px;">
            </div>
            <div style="padding: 10px; border-top: 1px solid #eee;">
                <textarea id="chat-input" placeholder="Type your query here..." 
                    style="width: 100%; height: 60px; margin-bottom: 5px; padding: 5px; border: 1px solid #ddd; border-radius: 4px; resize: none;"></textarea>
                <button id="send-button" style="width: 100%; padding: 8px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Send
                </button>
            </div>
        `;

        document.body.appendChild(chatBox);

        const sendButton = chatBox.querySelector('#send-button');
        const inputBox = chatBox.querySelector('#chat-input');

        sendButton.addEventListener('click', handleSendMessage);
        inputBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
    }
}

function handleSendMessage() {
    const inputBox = document.querySelector('#chat-input');
    const userInput = inputBox.value.trim();
    
    if (userInput) {
        addMessage('You', userInput, 'user-message');
        inputBox.value = '';
        
        chrome.runtime.sendMessage({
            action: 'userInput',
            data: userInput
        });
    }
}

function addMessage(sender, text, className) {
    const container = document.querySelector('#response-container');
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        margin-bottom: 10px;
        padding: 8px;
        border-radius: 4px;
        background-color: ${className === 'user-message' ? '#e3f2fd' : '#f5f5f5'};
    `;
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'aiResponse') {
        addMessage('AI', message.data, 'ai-message');
    }
    return true;
});

// Initialize the chat box
createChatBox();
