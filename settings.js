document.addEventListener('DOMContentLoaded', function() {
  const translationService = document.getElementById('translationService');
  const chatgptSettings = document.getElementById('chatgptSettings');
  const apiKey = document.getElementById('apiKey');
  const proxyUrl = document.getElementById('proxyUrl');
  const verifyProxyButton = document.getElementById('verifyProxy');
  const proxyStatus = document.getElementById('proxyStatus');
  const chatgptModel = document.getElementById('chatgptModel');
  const saveButton = document.getElementById('saveSettings');
  const message = document.getElementById('message');

  // 初始化默认设置
  chrome.storage.sync.get(['translationService', 'apiKey', 'proxyUrl', 'chatgptModel'], function(result) {
    translationService.value = result.translationService || 'chatgpt';
    apiKey.value = result.apiKey || 'sk-fIKdw7QS7rFRS2nWK3B3mvvNBwGUWgcD7KN6oVi3R2SjKmCu';
    proxyUrl.value = result.proxyUrl || 'https://api.chatanywhere.tech';
    chatgptModel.value = result.chatgptModel || 'gpt-3.5-turbo';
    updateChatGPTSettingsVisibility();
  });

  translationService.addEventListener('change', updateChatGPTSettingsVisibility);

  function updateChatGPTSettingsVisibility() {
    chatgptSettings.style.display = translationService.value === 'chatgpt' ? 'block' : 'none';
  }

  saveButton.addEventListener('click', function() {
    chrome.storage.sync.set({
      translationService: translationService.value,
      apiKey: apiKey.value.trim(),
      proxyUrl: proxyUrl.value.trim(),
      chatgptModel: chatgptModel.value
    }, function() {
      message.textContent = '设置已保存';
      setTimeout(() => { message.textContent = ''; }, 3000);
    });
  });

  verifyProxyButton.addEventListener('click', function() {
    const proxyUrlValue = proxyUrl.value.trim();
    if (!proxyUrlValue) {
      proxyStatus.textContent = '请输入代理 URL';
      proxyStatus.style.color = 'red';
      return;
    }

    proxyStatus.textContent = '正在验证...';
    proxyStatus.style.color = 'blue';

    chrome.runtime.sendMessage({
      action: "verifyProxy",
      proxyUrl: proxyUrlValue
    }, function(response) {
      if (chrome.runtime.lastError) {
        proxyStatus.textContent = '验证失败: ' + chrome.runtime.lastError.message;
        proxyStatus.style.color = 'red';
      } else if (response.success) {
        proxyStatus.textContent = '代理可用';
        proxyStatus.style.color = 'green';
      } else {
        proxyStatus.textContent = '验证失败: ' + response.error;
        proxyStatus.style.color = 'red';
      }
    });
  });
});