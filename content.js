console.log("Content script loaded");

let lastSelectedText = '';

document.addEventListener('mouseup', function(event) {
    console.log("Mouse up event triggered");
    const selectedText = window.getSelection().toString().trim();
    console.log("Selected text:", selectedText);
    if (selectedText && selectedText !== lastSelectedText) {
        lastSelectedText = selectedText;
        console.log("Sending translation request for:", selectedText);
        chrome.runtime.sendMessage({
            action: "translate",
            text: selectedText,
            targetLang: "zh-CN" // 默认翻译为中文，你可以根据需要修改
        }, function(response) {
            console.log("Received translation response:", response);
            if (response && response.translatedText) {
                showTranslation(response.translatedText, event.pageX, event.pageY);
            } else if (response && response.error) {
                console.error("Translation error:", response.error);
            }
        });
    }
});

function showTranslation(text, x, y) {
    console.log("Showing translation:", text);
    let div = document.getElementById('translation-popup');
    if (!div) {
        div = document.createElement('div');
        div.id = 'translation-popup';
        document.body.appendChild(div);
    }
    div.textContent = text;
    div.style.position = 'absolute';
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    div.style.backgroundColor = 'white';
    div.style.border = '1px solid black';
    div.style.padding = '5px';
    div.style.zIndex = '10000';
    div.style.maxWidth = '300px';
    div.style.display = 'block';

    // 点击其他地方时隐藏翻译结果
    document.addEventListener('mousedown', function hideTranslation(e) {
        if (e.target !== div) {
            div.style.display = 'none';
            document.removeEventListener('mousedown', hideTranslation);
        }
    });
}