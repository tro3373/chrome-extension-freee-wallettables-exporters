// "content_scripts": [
//   {
//     "matches": [
//       "https://secure.freee.co.jp/wallet/walletables/"
//     ],
//     "js": [
//       "jquery-3.6.0.min.js",
//       "main.js"
//     ]
//   }
// ]
/* eslint no-undef: 0 */
chrome.browserAction.onClicked.addListener((tab) => {
  chrome.tabs.executeScript(tab.id, { file: 'jquery-3.6.0.min.js' });
  chrome.tabs.executeScript(tab.id, { file: 'content.js' });
});
