document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('inputText');
    const enhanceBtn = document.getElementById('enhanceBtn');
    const outputSection = document.getElementById('outputSection');
    const outputText = document.getElementById('outputText');
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');
    const copyBtn = document.getElementById('copyBtn');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');

    // Handle image upload
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                previewImage.src = event.target.result;
                imagePreview.classList.remove('hidden');
                inputText.value = ''; // Clear text input when image is uploaded
            };
            reader.readAsDataURL(file);
        }
    });

    // Real Gemini API integration
    async function callGeminiAPI(text) {
        const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
        
        const prompt = `Correct and enhance this handwritten text, fixing any spelling, grammar, and punctuation errors while preserving the original meaning:\n\n"${text}"\n\nRespond with only the corrected text.`;
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'API request failed');
        }

        return data.candidates[0].content.parts[0].text.trim();
    }

    enhanceBtn.addEventListener('click', async function() {
        const text = inputText.value.trim();
        
        if (!text) {
            showError('Please enter some text to enhance');
            return;
        }

        try {
            // Show loading state
            enhanceBtn.disabled = true;
            enhanceBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
            
            // Call API (mock implementation)
            const correctedText = await callGeminiAPI(text);
            
            // Display results
            outputText.textContent = correctedText;
            outputSection.classList.remove('hidden');
            errorSection.classList.add('hidden');
        } catch (error) {
            showError('Failed to enhance text. Please try again later.');
            console.error('API Error:', error);
        } finally {
            // Reset button
            enhanceBtn.disabled = false;
            enhanceBtn.innerHTML = '<i class="fas fa-magic mr-2"></i> Enhance Text';
        }
    });

    copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(outputText.textContent)
            .then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => {
                showError('Failed to copy text');
                console.error('Copy error:', err);
            });
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorSection.classList.remove('hidden');
        outputSection.classList.add('hidden');
    }
});