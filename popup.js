document.addEventListener('DOMContentLoaded', function() {
  console.log("Popup loaded");
  const translateButton = document.getElementById('translate');
  const inputText = document.getElementById('input');
  const outputDiv = document.getElementById('output');
  const errorDiv = document.getElementById('error');
  const targetLangSelect = document.getElementById('targetLang');
  const settingsButton = document.getElementById('settingsButton');
  const logArea = document.getElementById('logArea');
  const openBlogButton = document.getElementById('openBlog');
  const openChatGPTWebButton = document.getElementById('openChatGPTWeb');

  // 添加复制事件监听器
  inputText.addEventListener('copy', function(e) {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      translateText(selectedText, targetLangSelect.value);
    }
  });

  // 添加键盘事件监听器
  inputText.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 阻止默认的换行行为
      translateButton.click(); // 触发翻译按钮的点击事件
    }
  });

  translateButton.addEventListener('click', function() {
    console.log("Translate button clicked");
    const text = inputText.value;
    const targetLang = targetLangSelect.value;
    translateText(text, targetLang);
  });

  function addToLog(message, isError = false) {
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    if (isError) {
      logEntry.style.color = 'red';
    }
    logArea.appendChild(logEntry);
    logArea.scrollTop = logArea.scrollHeight;
  }

  function showTranslationPopup(translatedText) {
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.left = '50%';
    popup.style.top = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.padding = '20px';
    popup.style.backgroundColor = 'white';
    popup.style.border = '1px solid black';
    popup.style.zIndex = '10001';
    popup.textContent = translatedText;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.onclick = function() {
      document.body.removeChild(popup);
    };
    popup.appendChild(closeButton);

    document.body.appendChild(popup);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
      addToLog('翻译结果已复制到剪贴板');
    }, function(err) {
      console.error('无法复制文本: ', err);
      addToLog('无法复制文本到剪贴板', true);
    });
  }

  function translateText(text, targetLang) {
    errorDiv.textContent = ""; // 清除之前的错误信息
    outputDiv.textContent = "翻译中..."; // 显示加载状态
    addToLog(`开始翻译: "${text}" 到 ${targetLang}`);

    chrome.runtime.sendMessage({
      action: "translate", 
      text: text, 
      targetLang: targetLang
    }, function(response) {
      console.log("Received response:", response);
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
        errorDiv.textContent = "Error: " + chrome.runtime.lastError.message;
        outputDiv.textContent = ""; // 清除加载状态
        addToLog(`翻译错误: ${chrome.runtime.lastError.message}`, true);
      } else if (response && response.error) {
        console.error("Translation error:", response.error);
        errorDiv.textContent = "Error: " + response.error;
        outputDiv.textContent = ""; // 清除加载状态
        addToLog(`翻译错误: ${response.error}`, true);
        if (response.error.includes('API key is missing')) {
          addToLog('请在设置中添加有效的 API 密钥', true);
        }
      } else if (response && response.translatedText) {
        console.log("Received translation:", response.translatedText);
        outputDiv.textContent = response.translatedText;
        addToLog(`翻译完成: "${response.translatedText}"`);
        showTranslationPopup(response.translatedText);
        copyToClipboard(response.translatedText);
      } else {
        console.error("Unexpected response:", response);
        errorDiv.textContent = "Error: Unexpected response from translation service";
        outputDiv.textContent = ""; // 清除加载状态
        addToLog(`翻译错误: 未知响应`, true);
      }
    });
  }

  settingsButton.addEventListener('click', function() {
    console.log("Settings button clicked");
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('settings.html'));
    }
  });

  openBlogButton.addEventListener('click', function() {
    window.open('https://bk.100661.xyz', '_blank');
  });

  openChatGPTWebButton.addEventListener('click', function() {
    window.open('https://99981.fun/', '_blank');
  });

  document.getElementById('openWebview').addEventListener('click', function() {
    // 设置窗口的宽度和高度
    const width = 800;  // 可以根据需要调整宽度
    const height = 600; // 可以根据需要调整高度
    window.open('webview.html', 'webviewWindow', `width=${width},height=${height}`);
  });

  document.getElementById('openBlog').addEventListener('click', function() {
    window.open('https://bk.100661.xyz', 'BlogWindow', 'width=800,height=600');
  });

  document.getElementById('openChatGPTWeb').addEventListener('click', function() {
    window.open('https://99981.fun/', 'ChatGPTWebWindow', 'width=800,height=600');
  });
});