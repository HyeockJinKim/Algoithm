import { zip_problems } from "./js/boj";

let username = 'gurwls9628'

chrome.storage.local.get('username', function(data) {
  username = data.username;
});

let changeColor = document.getElementById("changeColor");
changeColor.onclick = async function(element) {
  await zip_problems(username);
};