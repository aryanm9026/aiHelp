// popup.js
document.addEventListener('DOMContentLoaded', function() {
    // Load saved API key
    chrome.storage.local.get(['openai_api_key'], function(result) {
        if (result.openai_api_key) {
            document.getElementById('api-key-input').value = result.openai_api_key;
        }
    });

    // Save API key
    document.getElementById('save-api-key').addEventListener('click', function() {
        const apiKey = document.getElementById('api-key-input').value.trim();
        if (apiKey) {
            chrome.storage.local.set({ 'openai_api_key': apiKey }, function() {
                const status = document.getElementById('status');
                status.textContent = 'API key saved successfully!';
                setTimeout(() => status.textContent = '', 2000);
            });
        } else {
            const status = document.getElementById('status');
            status.textContent = 'Please enter an API key';
            status.style.color = 'red';
            setTimeout(() => {
                status.textContent = '';
                status.style.color = 'green';
            }, 2000);
        }
    });
});