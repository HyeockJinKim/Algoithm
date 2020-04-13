let username = 'gurwls9628'

chrome.storage.local.get('username', function(data) {
  username = data.username;
});

let get_url = (url) => fetch(url).then(data => data.text());

let get_html = (url) => get_url(url).then(html => new DOMParser().parseFromString(html, "text/html"));

let get_textContent = (problem_infos, keyword) => problem_infos.map(async data => {
  let html = await data;
  let content = html.getElementById(keyword);
  return content != null ? html.getElementById(keyword).textContent : '';
});

let get_cells = (problem_infos, keyword) => problem_infos.map(async data => {
  let html = await data;
  return html.getElementById(keyword).rows[1].cells;
});

async function get_problems(username) {
  let html = await get_html('https://www.acmicpc.net/user/'+username);
  let problems = html.getElementsByClassName('panel-body')[0]
    .getElementsByClassName('problem_number');

  return [...problems].map(name => name.textContent);
}

async function get_problem_infos(problems) {
  let problem_infos = problems.map(async problem => await get_html('https://www.acmicpc.net/problem/'+problem));

  let titles = get_textContent(problem_infos, 'problem_title');
  let descriptions = get_textContent(problem_infos, 'problem_description');
  let inputs = get_textContent(problem_infos, 'problem_input');
  let outputs = get_textContent(problem_infos, 'problem_output');

  let infos = get_cells(problem_infos, 'problem-info');

  return {
    titles,
    descriptions,
    inputs,
    outputs,
    infos,
  }
}

changeColor.onclick = async function(element) {
  let problems = await get_problems(username);
  console.log(get_problem_infos(problems))
};