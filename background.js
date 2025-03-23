// アイコンがクリックされたときの処理
chrome.action.onClicked.addListener((tab) => {
  // Gmailのページかどうかを確認
  if (tab.url && tab.url.includes('mail.google.com')) {
    // タブにメッセージを送信してコピー処理を実行
    chrome.tabs.sendMessage(tab.id, { action: 'copyContent' });
  }
});
