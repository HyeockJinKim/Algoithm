
function get_username() {
  switch (document.location.origin) {
    case "https://www.acmicpc.net":
      if (document.getElementsByClassName("loginbar")[0].childElementCount > 3)
        return document.getElementsByClassName('loginbar')[0].children[0].textContent;
  }
  return undefined;
}

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({username: get_username()});

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: ['www.acmicpc.net'].map(url => new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: url},
      })),
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});
