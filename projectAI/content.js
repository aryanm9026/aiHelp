// Create and display the chat box on the webpage
function createChatBox() {
    let chatBox = document.getElementById("ai-chat-box");
    if (!chatBox) {
        chatBox = document.createElement("div");
        chatBox.id = "ai-chat-box";
        chatBox.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            width: 300px;
            height: 400px;
            background: white;
            border: 1px solid #ccc;
            box-shadow: 0 4px 8px rgba(255, 0, 0, 0.2);
            overflow: auto;
            padding: 10px;
            z-index: 10000;
        `;

        // Add an input box
        const inputBox = document.createElement("textarea");
        inputBox.id = "chat-input";
        inputBox.placeholder = "Type your query here...";
        inputBox.style.cssText = `
            width: 100%;
            height: 50px;
            margin-top: 10px;
        `;

        // Add a send button
        const sendButton = document.createElement("button");
        sendButton.textContent = "Send";
        sendButton.style.cssText = `
            width: 100%;
            margin-top: 5px;
            background-color:rgb(76, 175, 79);
            color: white;
            border: none;
            padding: 10px;
            cursor: pointer;
        `;

        // Add a container for AI responses
        const responseContainer = document.createElement("div");
        responseContainer.id = "response-container";
        responseContainer.style.cssText = `
            height: calc(100% - 100px);
            overflow-y: auto;
        `;

        // Append everything to the chat box
        chatBox.appendChild(responseContainer);
        chatBox.appendChild(inputBox);
        chatBox.appendChild(sendButton);

        // Add the chat box to the body
        document.body.appendChild(chatBox);

        // Add event listener for the send button
        sendButton.addEventListener("click", () => {
            const userInput = inputBox.value;
            if (userInput.trim()) {
                addUserMessage(userInput); // Display user message
                sendToAI(userInput);       // Send user input to the AI
                inputBox.value = "";       // Clear input box
            }
        });
    }
}

// Display user message in the chat
function addUserMessage(message) {
    const responseContainer = document.getElementById("response-container");
    const userMessage = document.createElement("div");
    userMessage.textContent = `You: ${message}`;
    userMessage.style.cssText = "margin-bottom: 10px; font-weight: bold;";
    responseContainer.appendChild(userMessage);
    responseContainer.scrollTop = responseContainer.scrollHeight; // Auto-scroll
}

// Send the user's input to the AI via the background script
function sendToAI(userInput) {
    chrome.runtime.sendMessage({
        action: "userInput",
        data: userInput,
    });
}

// Receive and display AI response
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "aiResponse") {
        const aiResponse = message.data;
        const responseContainer = document.getElementById("response-container");
        const aiMessage = document.createElement("div");
        aiMessage.textContent = `AI: ${aiResponse}`;
        aiMessage.style.cssText = "margin-bottom: 10px;";
        responseContainer.appendChild(aiMessage);
        responseContainer.scrollTop = responseContainer.scrollHeight; // Auto-scroll
    }
});

// Initialize the chat box
createChatBox();
