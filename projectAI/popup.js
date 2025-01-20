document.getElementById("send-button").addEventListener("click", () => {
    const userInput = document.getElementById("chat-input").value;
    if (userInput.trim()) {
        const responseContainer = document.getElementById("response-container");
        const userMessage = document.createElement("div");
        userMessage.textContent = `You: ${userInput}`;
        responseContainer.appendChild(userMessage);
        document.getElementById("chat-input").value = "";

        // Send user input to the background script
        chrome.runtime.sendMessage({
            action: "userInput",
            data: userInput,
        });
    }
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "aiResponse") {
        const responseContainer = document.getElementById("response-container");
        const aiMessage = document.createElement("div");
        aiMessage.textContent = `AI: ${message.data}`;
        responseContainer.appendChild(aiMessage);
    }
});
