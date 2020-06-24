
chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: ['www.acmicpc.net'].map(url => new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: url},
      })),
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.url) {
      chrome.tabs.sendMessage( tabId, {
        message: "url",
      })
    }
  }
);