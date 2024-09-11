console.log("Background script loaded");

// 定义所有翻译相关的函数
const translateText = async (text, targetLanguage) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;

    try {
        console.log(`Sending request to ${url}`);
        const response = await fetch(url);

        console.log(`Received response with status: ${response.status}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(`Response data:`, data);

        if (data && data[0] && data[0][0] && data[0][0][0]) {
            return data[0][0][0];
        } else {
            throw new Error('No translated text in response');
        }
    } catch (error) {
        console.error('Error translating text:', error);
        throw error;
    }
};

const translateWithChatGPT = async (text, targetLanguage, apiKey, proxyUrl = null, model = 'gpt-3.5-turbo') => {
    const url = proxyUrl || 'https://api.openai.com/v1/chat/completions';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    const prompt = `Translate the following text to ${targetLanguage}: "${text}"`;
    const body = JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content.trim();
        } else {
            throw new Error('No translation result in the API response');
        }
    } catch (error) {
        console.error('Error translating text with ChatGPT:', error);
        throw error;
    }
};

const translate = async (text, targetLanguage, options = {}) => {
    console.log(`Translating text: "${text}" to ${targetLanguage}`);
    if (options.useChatGPT && options.apiKey) {
        if (!options.apiKey.trim()) {
            throw new Error('API key is missing. Please set it in the extension settings.');
        }
        return translateWithChatGPT(text, targetLanguage, options.apiKey, options.proxyUrl, options.chatgptModel);
    } else {
        return translateText(text, targetLanguage);
    }
};

async function verifyProxy(proxyUrl) {
    try {
        console.log("Verifying proxy:", proxyUrl);
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log("Proxy verification successful");
        return true;
    } catch (error) {
        console.error('Proxy verification failed:', error);
        throw error;
    }
}

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "translate") {
        chrome.storage.sync.get(['translationService', 'apiKey', 'proxyUrl', 'chatgptModel'], function(result) {
            const options = {
                useChatGPT: result.translationService === 'chatgpt',
                apiKey: result.apiKey,
                proxyUrl: result.proxyUrl,
                chatgptModel: result.chatgptModel
            };

            translate(request.text, request.targetLang, options)
                .then(translatedText => {
                    sendResponse({translatedText: translatedText});
                })
                .catch(error => {
                    sendResponse({error: error.message || 'Unknown error occurred'});
                });
        });
        return true; // 保持消息通道开放，以便异步响应
    }
});

console.log("background.js loaded");