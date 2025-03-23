// コンテンツスクリプト - Gmailのページで実行される

// ボタンを作成して追加する関数
function createCopyButton() {
  // すでにボタンが存在する場合は作成しない
  if (document.getElementById('gmail-copy-btn')) {
    return;
  }

  // ツールバーへの追加を試みる
  const toolbar = document.querySelector('div[gh="tm"] div[gh="mtb"]');
  if (toolbar) {
    // Gmailのスタイルに合わせたボタンを作成
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'T-I J-J5-Ji T-I-Js-Gs T-I-ax7 T-I-Js-IF';
    buttonContainer.setAttribute('role', 'button');
    buttonContainer.setAttribute('tabindex', '0');
    buttonContainer.id = 'gmail-copy-btn';
    buttonContainer.title = 'タイトルと本文をコピー';
    buttonContainer.style.marginLeft = '10px';

    // ボタン内のテキスト
    const buttonInnerText = document.createElement('div');
    buttonInnerText.className = 'T-I-ax7-text';
    buttonInnerText.textContent = 'コピー';
    buttonContainer.appendChild(buttonInnerText);

    // クリックイベントを追加
    buttonContainer.addEventListener('click', copyGmailContent);

    // ツールバーに追加
    toolbar.appendChild(buttonContainer);
    return;
  }

  // ツールバーが見つからない場合は独自のボタンを作成
  const copyButton = document.createElement('button');
  copyButton.id = 'gmail-copy-btn';
  copyButton.innerHTML = 'タイトルと本文をコピー';
  copyButton.style.position = 'fixed';
  copyButton.style.top = '10px';
  copyButton.style.right = '10px';
  copyButton.style.zIndex = '9999';
  copyButton.style.padding = '8px 12px';
  copyButton.style.backgroundColor = '#4285f4';
  copyButton.style.color = 'white';
  copyButton.style.border = 'none';
  copyButton.style.borderRadius = '4px';
  copyButton.style.cursor = 'pointer';

  // ホバー効果
  copyButton.style.transition = 'background-color 0.3s';
  copyButton.onmouseover = function() {
    this.style.backgroundColor = '#2b6edb';
  };
  copyButton.onmouseout = function() {
    this.style.backgroundColor = '#4285f4';
  };

  // クリックイベントを追加
  copyButton.addEventListener('click', copyGmailContent);

  // ボタンをページに追加
  document.body.appendChild(copyButton);
}

// メールのタイトルと本文をコピーする関数
function copyGmailContent() {
  try {
    // メールのタイトルを取得（複数の可能性のあるセレクタを試す）
    let subject = '';
    const subjectSelectors = [
      'h2[data-thread-id]',                    // 通常表示
      '.hP',                                   // 別の表示形式
      'div[role="main"] h1.ha',                // さらに別の表示形式
      'div[role="main"] .ha'                   // 一般的なヘッダー
    ];

    for (const selector of subjectSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        subject = element.textContent.trim();
        break;
      }
    }

    if (!subject) {
      subject = 'タイトルが見つかりません';
    }

    // メールの本文を取得（複数の可能性のあるセレクタを試す）
    let messageBodyElement = null;
    const bodySelectors = [
      'div[role="list"] div.a3s.aiL',        // 一般的なメール本文
      '.a3s.aiL',                             // 別の表示形式
      '.ii.gt div[dir="ltr"]',                // HTMLメール
      '.ii.gt',                               // プレーンテキストメール
      'div[role="main"] .iA.g6'               // メイン部分
    ];

    for (const selector of bodySelectors) {
      const element = document.querySelector(selector);
      if (element) {
        messageBodyElement = element;
        break;
      }
    }

    if (!messageBodyElement) {
      showNotification('メール本文が見つかりません。メールが開かれているか確認してください。', 'error');
      return;
    }

    // HTML形式の本文を取得
    const htmlContent = messageBodyElement.innerHTML;

    // タイトルとHTML本文を組み合わせる
    const combinedContent = `タイトル: ${subject}\n\n本文のHTML:\n${htmlContent}`;

    // クリップボードにコピー
    copyToClipboard(combinedContent);
    
    // 成功メッセージを表示
    showNotification('タイトルと本文をコピーしました！', 'success');
  } catch (error) {
    console.error('コピー中にエラーが発生しました:', error);
    showNotification('エラーが発生しました: ' + error.message, 'error');
  }
}

// クリップボードにコピーする関数
function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

// 通知を表示する関数
function showNotification(message, type = 'success') {
  // 既存の通知があれば削除
  const existingNotification = document.getElementById('gmail-copy-notification');
  if (existingNotification) {
    document.body.removeChild(existingNotification);
  }

  const notification = document.createElement('div');
  notification.id = 'gmail-copy-notification';
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.padding = '10px 15px';
  notification.style.color = 'white';
  notification.style.borderRadius = '4px';
  notification.style.zIndex = '10000';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  // 通知タイプに応じた色
  if (type === 'success') {
    notification.style.backgroundColor = '#4CAF50';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#F44336';
  } else {
    notification.style.backgroundColor = '#2196F3';
  }
  
  document.body.appendChild(notification);
  
  // 3秒後に通知を消す
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 500);
  }, 3000);
}

// 拡張機能からのメッセージリスナー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'copyContent') {
    copyGmailContent();
    sendResponse({status: 'copied'});
  } else if (request.action === 'checkGmail') {
    // Gmailページかどうかを確認して返答
    sendResponse({isGmail: window.location.href.includes('mail.google.com')});
  }
  return true;
});

// MutationObserverを使用してGmailのページが変更されたときにボタンを追加
const observer = new MutationObserver(function(mutations) {
  // Gmailのページが変更されたときにボタンを追加
  if (window.location.href.includes('mail.google.com')) {
    createCopyButton();
  }
});

// 監視を開始
observer.observe(document.body, { childList: true, subtree: true });

// 初期実行
if (window.location.href.includes('mail.google.com')) {
  // DOMが完全に読み込まれたときにボタンを追加
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createCopyButton);
  } else {
    createCopyButton();
  }
}
