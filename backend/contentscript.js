
function set_algorithm_site() {
  switch (document.location.origin) {
    case "https://www.acmicpc.net":
      chrome.storage.local.set({origin: "Boj"});
      if (document.getElementsByClassName("loginbar")[0].childElementCount > 3) {
        const username = document.getElementsByClassName('loginbar')[0].children[0].textContent;
        chrome.storage.local.set({username, origin: "Boj"});
      }
      break;
    default:
      // TODO: Check default.
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // listen for messages sent from background.js
    if (request.message === "url") {
      set_algorithm_site();
    }
  });
