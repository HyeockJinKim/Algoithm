import { zip_problems } from "./js/boj";

let download_boj = document.getElementById("download_boj");
download_boj.onclick = async function(element) {
  chrome.storage.local.get('username', async function(data) {
    let username = data.username;
    if (username === undefined) {
      alert("로그인이 필요합니다.")
    }
    await zip_problems(username);
  });
};