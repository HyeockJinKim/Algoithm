let username = 'gurwls9628'

chrome.storage.local.get('username', function(data) {
  username = data.username;
  console.log(data.username)
});

let get_url = async (url) => await fetch(url).then(data => data.text());

let get_html = async (url) => await fetch(url).then(data => data.text())
  .then(html => new DOMParser().parseFromString(html, "text/html"));

async function get_problems(username) {
  let html = await get_html('https://www.acmicpc.net/user/'+username);
  let problems = html.getElementsByClassName('panel-body')[0]
    .getElementsByClassName('problem_number');

  return [...problems].map(name => name.textContent);
}

changeColor.onclick = async function(element) {
  console.log(await get_problems(username));
};