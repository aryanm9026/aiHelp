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
            height: 500px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            z-index: 10000;
            overflow: hidden; /* Prevent content from overflowing during resize */
        `;

        chatBox.innerHTML = `
            <div id="chat-header" style="padding: 10px; background: rgb(26 24 108); color: white; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; cursor: move;height: 45px;font-weight: 500;">
                <span>AI Coding Assistant</span>
                <button id="minimize-chat" style="background: none; border: none; color: white; cursor: pointer;">−</button>
            </div>
            <div id="extra-features"style="padding: 10px;background: rgb(217 216 245);color: white;/* border-radius: 8px; */display: flex;justify-content: space-between;height: 45px;font-weight: 500;height: 150px;"></div>
            <div style="padding: 10px;
            background: rgb(217 216 245);
            color: white;
            /* border-radius: 8px; */
            display: flex;
            justify-content: space-between;
            height: 45px;
            font-weight: 500;
            height: 150px;">
            </div>
            <div id="response-container" style="flex: 1; overflow-y: auto; padding: 10px;">
            </div>
            <div style="padding: 10px; border-top: 1px solid #eee;">
                <textarea id="chat-input" placeholder="Type your query here..." 
                    style="width: 100%; height:80px; margin-bottom: 5px; padding: 5px; border: 1px solid #ddd; border-radius: 4px; resize: none;background-color: #dbe9ff;color: #000000;"></textarea>
                <button id="send-button" style="width: 100%; padding: 8px;background: rgb(26 24 108); color: white; border: none; border-radius: 10px; cursor: pointer;font-weight: 500;">
                    Send
                </button>
            </div>
            <!-- Resize handles for all four corners -->
            <div id="resize-handle-top-left" style="position: absolute; top: 0; left: 0; width: 10px; height: 10px; background: #ccc; cursor: nw-resize;"></div>
            <div id="resize-handle-top-right" style="position: absolute; top: 0; right: 0; width: 10px; height: 10px; background: #ccc; cursor: ne-resize;"></div>
            <div id="resize-handle-bottom-left" style="position: absolute; bottom: 0; left: 0; width: 10px; height: 10px; background: #ccc; cursor: sw-resize;"></div>
            <div id="resize-handle-bottom-right" style="position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; background: #ccc; cursor: se-resize;"></div>
        `;

        document.body.appendChild(chatBox);

        const sendButton = chatBox.querySelector('#send-button');
        const inputBox = chatBox.querySelector('#chat-input');
        const minimizeButton = chatBox.querySelector('#minimize-chat');
        const responseContainer = chatBox.querySelector('#response-container');
        const chatHeader = chatBox.querySelector('#chat-header');
    // Create an 'Enhance Code' button inside extra-features div
        const enhanceButton = document.createElement('button');
        enhanceButton.textContent = 'Enhance Code';
        enhanceButton.style.cssText = `
            padding: 8px 16px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
        `;
        enhanceButton.addEventListener('click', async () => {
            // Extract the code content from the page
            const content = await extractCodeAndContent();
            const code = content?.code || '';  // Assuming the code is under `content.code`
            
            if (code) {
                // Send the extracted code to the AI API for enhancement
                const enhancedCode = await enhanceCodeWithAI(code);
                addMessage('AI', enhancedCode, 'ai-message');
            } else {
                addMessage('AI', 'No code found to enhance.', 'ai-message');
            }
        });

        // Append the 'Enhance Code' button to the #extra-features div
        const extraFeaturesDiv = chatBox.querySelector('#extra-features');
        extraFeaturesDiv.appendChild(enhanceButton);

        // Load the minimized state from localStorage
        let isMinimized = localStorage.getItem('chatMinimized') === 'true';

        // Set the initial state of the chat box
        if (isMinimized) {
            minimizeChatBox(chatBox, minimizeButton, responseContainer);
        }

        // Toggle the minimized state when the minimize button is clicked
        minimizeButton.addEventListener('click', () => {
            isMinimized = !isMinimized;
            localStorage.setItem('chatMinimized', isMinimized); // Save the state to localStorage

            if (isMinimized) {
                minimizeChatBox(chatBox, minimizeButton, responseContainer);
            } else {
                expandChatBox(chatBox, minimizeButton, responseContainer);
            }
        });

        // Add drag-to-move functionality
        let isDragging = false;
        let startDragX, startDragY, startBoxX, startBoxY;

        chatHeader.addEventListener('mousedown', (e) => {
            isDragging = true;
            startDragX = e.clientX;
            startDragY = e.clientY;
            startBoxX = parseInt(chatBox.style.left, 10) || chatBox.offsetLeft;
            startBoxY = parseInt(chatBox.style.top, 10) || chatBox.offsetTop;
            e.preventDefault(); // Prevent text selection while dragging
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - startDragX;
                const deltaY = e.clientY - startDragY;
                chatBox.style.left = `${startBoxX + deltaX}px`;
                chatBox.style.top = `${startBoxY + deltaY}px`;
            }
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Add resize functionality for all four corners
        const resizeHandles = {
            'top-left': chatBox.querySelector('#resize-handle-top-left'),
            'top-right': chatBox.querySelector('#resize-handle-top-right'),
            'bottom-left': chatBox.querySelector('#resize-handle-bottom-left'),
            'bottom-right': chatBox.querySelector('#resize-handle-bottom-right'),
        };

        let isResizing = false;
        let startX, startY, startWidth, startHeight, startTop, startLeft;
        let resizeCorner = null;

        Object.entries(resizeHandles).forEach(([corner, handle]) => {
            handle.addEventListener('mousedown', (e) => {
                isResizing = true;
                resizeCorner = corner;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = parseInt(document.defaultView.getComputedStyle(chatBox).width, 10);
                startHeight = parseInt(document.defaultView.getComputedStyle(chatBox).height, 10);
                startTop = parseInt(document.defaultView.getComputedStyle(chatBox).top, 10);
                startLeft = parseInt(document.defaultView.getComputedStyle(chatBox).left, 10);
                e.preventDefault(); // Prevent text selection while resizing
            });
        });

        window.addEventListener('mousemove', (e) => {
            if (isResizing) {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                let newWidth, newHeight, newTop, newLeft;

                switch (resizeCorner) {
                    case 'top-left':
                        newWidth = startWidth - deltaX;
                        newHeight = startHeight - deltaY;
                        newTop = startTop + deltaY;
                        newLeft = startLeft + deltaX;
                        break;
                    case 'top-right':
                        newWidth = startWidth + deltaX;
                        newHeight = startHeight - deltaY;
                        newTop = startTop + deltaY;
                        newLeft = startLeft;
                        break;
                    case 'bottom-left':
                        newWidth = startWidth - deltaX;
                        newHeight = startHeight + deltaY;
                        newTop = startTop;
                        newLeft = startLeft + deltaX;
                        break;
                    case 'bottom-right':
                        newWidth = startWidth + deltaX;
                        newHeight = startHeight + deltaY;
                        newTop = startTop;
                        newLeft = startLeft;
                        break;
                }

                // Apply new dimensions without constraints
                chatBox.style.width = `${newWidth}px`;
                chatBox.style.height = `${newHeight}px`;
                if (resizeCorner === 'top-left' || resizeCorner === 'bottom-left') {
                    chatBox.style.left = `${newLeft}px`;
                }
                if (resizeCorner === 'top-left' || resizeCorner === 'top-right') {
                    chatBox.style.top = `${newTop}px`;
                }
            }
        });

        window.addEventListener('mouseup', () => {
            isResizing = false;
            resizeCorner = null;
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

// Function to send the code to the AI API and get the enhanced code
const apiKey = 'AIzaSyAZCJDOnI3c3yzrNoJVLe1FTudBRgkFw5c'; 
async function enhanceCodeWithAI(code) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` // Use the actual API key
            },
            body: JSON.stringify({
                model: "gemini-1.5-pro",
                messages: [{ role: "user", content: `Enhance this code: \n${code}` }]
            })
        });

        const data = await response.json();

        // Check if choices exist and contain at least one element
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content || 'Error: Could not enhance the code.';
        } else {
            return 'Error: No valid response from the API.';
        }
    } catch (error) {
        console.error('Error enhancing code:', error);
        return 'Error enhancing the code.';
    }
}

// Function to minimize the chat box
function minimizeChatBox(chatBox, minimizeButton, responseContainer) {
    chatBox.style.height = 'auto';
    chatBox.style.width = '200px'; // Make the minimized chat box narrower
    responseContainer.style.display = 'none';
    minimizeButton.textContent = '+'; // Change the button to a "+" icon
}

// Function to expand the chat box
function expandChatBox(chatBox, minimizeButton, responseContainer) {
    chatBox.style.height = '400px';
    chatBox.style.width = '300px'; // Restore the original width
    responseContainer.style.display = 'block';
    minimizeButton.textContent = '−'; // Change the button to a "−" icon
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
        background-color: ${className === 'user-message' ? 'rgb(204, 228, 247)' : 'rgb(201 243 203)'};
        color: #000;
    `;

    // Preprocess the text to replace ** with <b> and __ with <i>
    const processedText = text
        .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') // Replace **bold** with <b>bold</b>
        .replace(/__(.+?)__/g, '<i>$1</i>');   // Replace __italic__ with <i>italic</i>

    // Check if the text contains code blocks
    if (processedText.includes('```')) {
        // Split the text into parts: code and non-code
        const parts = processedText.split('```');
        parts.forEach((part, index) => {
            if (index % 2 === 1) {
                // This is a code block
                const codeContent = part.trim();
                const language = processedText.match(/```(\w+)/)?.[1] || 'plaintext'; // Detect language if specified

                // Create a pre element for the code block
                const pre = document.createElement('pre');
                pre.style.cssText = `
                    background-color: #f4f4f4;
                    padding: 10px;
                    border-radius: 4px;
                    overflow-x: auto;
                    font-family: monospace;
                    font-size: 15px;
                    white-space: pre-wrap;
                    margin: 10px 0;
                `;

                // Create a code element for syntax highlighting
                const code = document.createElement('code');
                code.className = `language-${language}`;
                code.textContent = codeContent;

                // Append the code to the pre element
                pre.appendChild(code);

                // Add a "Copy Code" button
                const copyButton = document.createElement('button');
                copyButton.textContent = 'Copy Code';
                copyButton.style.cssText = `
                    margin-top: 5px;
                padding: 5px 10px;
                font-size: 11px;
                background-color: rgb(0, 123, 255);
                color: white;
                border: none;
                border-radius: 13px;
                cursor: pointer;
                width: 80px;
                height: 30px;
                font-weight: 500;
                `;
                copyButton.addEventListener('click', () => {
                    navigator.clipboard.writeText(codeContent).then(() => {
                        alert('Code copied to clipboard!');
                    });
                });

                // Append the code block and button to the message
                messageDiv.appendChild(pre);
                messageDiv.appendChild(copyButton);
            } else {
                // This is a text block, render it as HTML
                const textNode = document.createElement('div');
                textNode.innerHTML = `<strong>${sender}:</strong> ${formatText(part)}`;
                textNode.style.marginBottom = '10px'; // Add spacing between text blocks
                messageDiv.appendChild(textNode);
            }
        });
    } else {
        // No code blocks, just render the text as HTML
        const textNode = document.createElement('div');
        textNode.innerHTML = `<strong>${sender}:</strong> ${formatText(processedText)}`;
        messageDiv.appendChild(textNode);
    }

    // Append the message to the container and scroll to the bottom
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

// Helper function to format text with point-wise lists
function formatText(text) {
    // Split the text into lines
    const lines = text.split('\n');
    let formattedText = '';

    lines.forEach((line) => {
        // Check if the line starts with a number (e.g., "1.", "2.", etc.)
        if (/^\d+\./.test(line.trim())) {
            // Format as a list item
            formattedText += `<div style="margin-left: 20px; margin-bottom: 5px;">${line}</div>`;
        } else {
            // Format as a regular paragraph
            formattedText += `<div style="margin-bottom: 5px;">${line}</div>`;
        }
    });

    return formattedText;
}
// Function to format code with indentation
function formatText(text) {
    // Split the text into lines
    const lines = text.split('\n');
    let formattedText = '';

    lines.forEach((line) => {
        // Replace backtick-enclosed text with a styled span
        line = line.replace(/`([^`]+)`/g, '<span style="display: inline-block; padding: 2px 6px; background-color: #f4f4f4; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; font-size: 14px;">$1</span>');

        // Check if the line starts with a number (e.g., "1.", "2.", etc.)
        if (/^\d+\./.test(line.trim())) {
            // Format as a list item
            formattedText += `<div style="margin-left: 20px; margin-bottom: 5px;">${line}</div>`;
        } else {
            // Format as a regular paragraph
            formattedText += `<div style="margin-bottom: 5px;">${line}</div>`;
        }
    });

    return formattedText;
}




chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'aiResponse') {
        addMessage('AI', message.data, 'ai-message');
    }
    return true;
});

// Initialize the chat box
createChatBox();
