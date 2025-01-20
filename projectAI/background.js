// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "userInput") {
        handleAIRequest(message.data)
            .then(aiResponse => {
                chrome.tabs.sendMessage(sender.tab.id, {
                    action: "aiResponse",
                    data: aiResponse
                });
            })
            .catch(error => {
                chrome.tabs.sendMessage(sender.tab.id, {
                    action: "aiResponse",
                    data: `Error: ${error.message}`
                });
            });
        return true;
    }
});

async function getAPIKey() {
    const result = await chrome.storage.local.get(['openai_api_key']);
    if (!result.openai_api_key) {
        throw new Error("Please set your OpenAI API key in the extension popup");
    }
    return result.openai_api_key;
}

async function handleAIRequest(userInput) {
    try {
        const apiKey = await getAPIKey();
        if (!apiKey) throw new Error("API key not configured");

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: userInput }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("API Error Response:", data);
            throw new Error(data.error?.message || `API request failed with status ${response.status}`);
        }

        if (!data.choices?.[0]?.message?.content) {
            throw new Error("Invalid API response structure");
        }

        return data.choices[0].message.content;
        
    } catch (error) {
        console.error("API Error:", error);
        throw new Error(`AI processing failed: ${error.message}`);
    }
}
