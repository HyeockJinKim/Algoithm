const boj = require(`./js/boj`);

let username = 'gurwls9628'

chrome.storage.local.get('username', function(data) {
  username = data.username;
});

let changeColor = document.getElementById("changeColor");
changeColor.onclick = async function(element) {
  let problems = await boj.get_problems(username);
  let problem_infos = boj.get_problem_infos(problems)
  let solutions = boj.get_solution_infos(problems, username);
  let sols = await solutions;
  let source = boj.get_source(sols.numbers);
  console.log(source)
};