/* eslint no-undef: 0 */
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
      target: {tabId: tab.id, allFrames: false},
      files: [
        'jquery-3.6.0.min.js',
        'content.js'
      ],
  });
});
