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

    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            console.log(`Sending request to OpenAI API with model: ${model}`);
            let fetchOptions = {
                method: 'POST',
                headers: headers,
                body: body
            };

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

            fetchOptions.signal = controller.signal;

            const response = await fetch(url, fetchOptions);
            clearTimeout(timeout);

            console.log(`Received response with status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log(`Response data:`, data);

            if (data.choices && data.choices.length > 0) {
                return data.choices[0].message.content.trim();
            } else {
                throw new Error('No translation result in the API response');
            }
        } catch (error) {
            console.error(`Attempt ${retries + 1} failed:`, error);
            retries++;
            if (retries >= maxRetries) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // 等待一段时间后重试
        }
    }
};

// 默认使用免费的翻译服务
const translate = async (text, targetLanguage, options = {}) => {
    console.log(`Translating text: "${text}" to ${targetLanguage}`);
    if (options.useChatGPT && options.apiKey) {
        return translateWithChatGPT(text, targetLanguage, options.apiKey, options.proxyUrl, options.chatgptModel);
    } else {
        return translateText(text, targetLanguage);
    }
};

export { translate };

console.log("translate.js loaded");