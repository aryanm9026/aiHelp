chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "sendProblemData") {
        const { title, description } = message.data;

        // Call the AI API (OpenAI, for instance)
        fetch("https://api.openai.com/v1/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer YOUR_API_KEY`,
            },
            body: JSON.stringify({
                model: "text-davinci-003",
                prompt: `Provide guidance for the following coding problem:\n\nTitle: ${title}\nDescription: ${description}`,
                max_tokens: 500,
            }),
        })
        .then(response => response.json())
        .then(data => {
            // Send the AI response back to the content script
            chrome.tabs.sendMessage(sender.tab.id, {
                action: "receiveAIResponse",
                data: data.choices[0].text,
            });
        })
        .catch(err => console.error("Error:", err));
    }
});
