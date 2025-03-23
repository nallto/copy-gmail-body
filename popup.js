document.addEventListener('DOMContentLoaded', function() {
  const copyButton = document.getElementById('copy-button');
  const statusMessage = document.getElementById('status-message');

  // 現在のタブがGmailかどうかを確認
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      const currentTab = tabs[0];
      
      // Gmailページかどうかを確認
      if (currentTab.url && currentTab.url.includes('mail.google.com')) {
        // コンテンツスクリプトに問い合わせる
        chrome.tabs.sendMessage(currentTab.id, {action: 'checkGmail'}, function(response) {
          if (chrome.runtime.lastError) {
            // エラー処理
            statusMessage.textContent = 'ページと通信できません。ページをリロードしてください。';
            statusMessage.className = 'error';
            return;
          }
          
          if (response && response.isGmail) {
            // Gmailページなのでボタンを有効化
            copyButton.disabled = false;
            statusMessage.textContent = 'コピーする準備ができました';
            statusMessage.className = 'success';
          } else {
            statusMessage.textContent = 'Gmailページではありません';
          }
        });
      } else {
        statusMessage.textContent = 'Gmailページを開いてください';
      }
    }
  });

  // コピーボタンクリック時の処理
  copyButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        // コンテンツスクリプトにコピー命令を送信
        chrome.tabs.sendMessage(tabs[0].id, {action: 'copyContent'}, function(response) {
          if (chrome.runtime.lastError) {
            statusMessage.textContent = 'エラーが発生しました。ページをリロードしてください。';
            statusMessage.className = 'error';
            return;
          }
          
          if (response && response.status === 'copied') {
            statusMessage.textContent = 'コピーしました！';
            statusMessage.className = 'success';
            
            // 2秒後にポップアップを閉じる
            setTimeout(function() {
              window.close();
            }, 2000);
          } else {
            statusMessage.textContent = 'コピーに失敗しました';
            statusMessage.className = 'error';
          }
        });
      }
    });
  });
});
