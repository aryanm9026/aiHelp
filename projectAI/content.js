// content.js
// content.js - Add this comprehensive extraction function
async function extractCodeAndContent() {
    try {
        const url = window.location.href;
        let content = null;

        // LeetCode extraction
        if (url.includes('leetcode.com')) {
            const problemTitle = document.querySelector('[data-cy="question-title"]')?.textContent || '';
            const problemDifficulty = document.querySelector('[diff]')?.textContent || '';
            const problemDescription = document.querySelector('[data-cy="question-content"]')?.textContent || '';
            const codeEditor = document.querySelector('.monaco-editor')?.textContent || '';
            
            content = {
                type: 'leetcode',
                title: problemTitle,
                difficulty: problemDifficulty,
                description: problemDescription,
                code: codeEditor,
                url: url
            };
        }
        // CodeForces extraction
        else if (url.includes('codeforces.com')) {
            const problemTitle = document.querySelector('.problem-statement .title')?.textContent || '';
            const timeLimit = document.querySelector('.time-limit')?.textContent || '';
            const memoryLimit = document.querySelector('.memory-limit')?.textContent || '';
            const problemDescription = document.querySelector('.problem-statement')?.textContent || '';
            const inputSpec = document.querySelector('.input-specification')?.textContent || '';
            const outputSpec = document.querySelector('.output-specification')?.textContent || '';
            const sampleTests = Array.from(document.querySelectorAll('.sample-test')).map(sample => ({
                input: sample.querySelector('.input pre')?.textContent || '',
                output: sample.querySelector('.output pre')?.textContent || ''
            }));

            content = {
                type: 'codeforces',
                title: problemTitle,
                timeLimit: timeLimit,
                memoryLimit: memoryLimit,
                description: problemDescription,
                inputSpec: inputSpec,
                outputSpec: outputSpec,
                sampleTests: sampleTests,
                url: url
            };
        }
        // Jupyter Notebook extraction
        else if (url.includes('jupyter') || url.includes('notebook') || document.querySelector('.jupyter-notebook')) {
            const cells = Array.from(document.querySelectorAll('.cell'));
            const notebookContent = cells.map(cell => {
                const cellType = cell.querySelector('.code-cell') ? 'code' : 'markdown';
                const content = cell.querySelector('.input_area')?.textContent || 
                              cell.querySelector('.text_cell_render')?.textContent || '';
                const output = cell.querySelector('.output_area')?.textContent || '';
                
                return {
                    type: cellType,
                    content: content,
                    output: output
                };
            });

            content = {
                type: 'jupyter',
                cells: notebookContent,
                url: url
            };
        }
        // Google Colab extraction
        else if (url.includes('colab.google')) {
            const cells = Array.from(document.querySelectorAll('.cell'));
            const notebookContent = cells.map(cell => {
                const cellType = cell.querySelector('.code') ? 'code' : 'markdown';
                const content = cell.querySelector('.code')?.textContent || 
                              cell.querySelector('.text')?.textContent || '';
                const output = cell.querySelector('.output')?.textContent || '';
                
                return {
                    type: cellType,
                    content: content,
                    output: output
                };
            });

            content = {
                type: 'colab',
                cells: notebookContent,
                url: url
            };
        }

        console.log('Extracted content:', content);
        return content;
    } catch (error) {
        console.error('Error extracting content:', error);
        return null;
    }
}
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
            <div style="padding: 10px; background:rgb(0, 0, 0); color: white; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between;">
                <span>AI Coding Assistant</span>
                <button id="minimize-chat" style="background: none; border: none; color: white; cursor: pointer;">−</button>
            </div>
            <div id="response-container" style="flex: 1; overflow-y: auto; padding: 10px;">
            </div>
            <div style="padding: 10px; border-top: 1px solid #eee;">
                <textarea id="chat-input" placeholder="Type your query here..." 
                    style="width: 100%; height: 60px; margin-bottom: 5px; padding: 5px; border: 1px solid #ddd; border-radius: 4px; resize: none;"></textarea>
                <button id="send-button" style="width: 100%; padding: 8px; background:rgb(0, 0, 0); color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Send
                </button>
            </div>
        `;

        document.body.appendChild(chatBox);

        const sendButton = chatBox.querySelector('#send-button');
        const inputBox = chatBox.querySelector('#chat-input');
        const minimizeButton = chatBox.querySelector('#minimize-chat');
        const responseContainer = chatBox.querySelector('#response-container');

        let isMinimized = false;
        minimizeButton.addEventListener('click', () => {
            if (isMinimized) {
                responseContainer.style.display = 'block';
                chatBox.style.height = '400px';
                minimizeButton.textContent = '−';
            } else {
                responseContainer.style.display = 'none';
                chatBox.style.height = 'auto';
                minimizeButton.textContent = '+';
            }
            isMinimized = !isMinimized;
        });

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
        background-color: ${className === 'user-message' ? '#cce4f7' : '#d9d9d9'};
        color: #000;
    `;

    if (className === 'ai-message' && text.includes('```')) {
        // Extract and format the code
        const codeContent = text.replace(/```[\s\S]*?\n|```/g, '').trim(); // Remove backticks and trim
        const language = text.match(/```(\w+)/)?.[1] || 'plaintext'; // Detect language if specified

        const pre = document.createElement('pre');
        const code = document.createElement('code');
        pre.style.cssText = `
            background-color: #f4f4f4;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
            font-family: monospace;
            font-size: 16px; /* Increase font size for better readability */
            white-space: pre-wrap; /* Wrap long lines */
        `;
        code.className = `language-${language}`; // Use for potential syntax highlighting
        code.textContent = formatCode(codeContent); // Properly formatted code

        pre.appendChild(code);

        // Add a "Copy Code" button
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy Code';
        copyButton.style.cssText = `
            margin-top: 5px;
            padding: 5px 10px;
            font-size: 10px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(codeContent).then(() => {
                alert('Code copied to clipboard!');
            });
        });

        // Append the code block and button
        messageDiv.appendChild(pre);
        messageDiv.appendChild(copyButton);
    } else {
        // Regular text message
        messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    }

    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

// Function to format code with indentation
function formatCode(code) {
    try {
        const lines = code.split('\n');
        let minIndent = Math.min(
            ...lines
                .filter(line => line.trim()) // Ignore empty lines
                .map(line => line.match(/^\s*/)?.[0].length || 0) // Count leading spaces
        );
        return lines
            .map(line => (line.startsWith(' '.repeat(minIndent)) ? line.slice(minIndent) : line))
            .join('\n');
    } catch {
        return code; // If formatting fails, return the code as is
    }
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'aiResponse') {
        addMessage('AI', message.data, 'ai-message');
    }
    return true;
});

// Initialize the chat box
createChatBox();