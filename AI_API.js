fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "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",
    },
    body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: "Explain this coding problem..." }],
        stream: true,
    }),
})
.then(response => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let result = "";

    function readChunk() {
        reader.read().then(({ done, value }) => {
            if (done) {
                console.log("Stream complete!");
                console.log(result); // Final processed response
                return;
            }
            chunk = decoder.decode(value, { stream: true });
            result += chunk;
            console.log(chunk); // Logs the partial response
            readChunk(); // Continue reading
        });
    }
    readChunk(); // Start reading
})
.catch(err => console.error("Fetch error:", err));

console.log('AI_API.js');