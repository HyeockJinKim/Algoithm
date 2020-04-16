const JSZip = require(`jszip`);
const fileSaver = require(`file-saver`);

let get_url = (url) => fetch(url).then(data => data.text());

let get_html = (url) => get_url(url).then(html => new DOMParser().parseFromString(html, "text/html"));

let get_text = (infos, index) => infos.map(async data => {
  let cell = await data;
  return cell[index].textContent;
});

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

async function get_solution_infos(problems, username) {
  let solution = problems.map(async problem =>
    await get_html('https://www.acmicpc.net/status?from_mine=1&problem_id='+problem+'&user_id='+username));

  let infos = get_cells(solution, 'status-table');
  let numbers = get_text(infos, 0);
  let success = get_text(infos, 3);
  let memory = get_text(infos, 4);
  let time = get_text(infos, 5);
  let language = infos.map(async info => {
    let temp = await info;
    return temp[6].textContent.split('/')[0].trim()
  });
  let length = get_text(infos, 7);

  return {
    numbers,
    success,
    memory,
    time,
    language,
    length,
  }
}

async function get_source(solutions) {
  return solutions.map(async solution => {
    let url = await solution;
    return await get_url('https://www.acmicpc.net/source/download/' + url)
  });
}

function language_to_extension(language) {
  switch (language) {
    case "Java":
    case "Java (OpenJDK)":
    case "Java 11":
      return ".java";
    case "C++":
    case "C++11":
    case "C++14":
    case "C++17":
    case "C++ (Clang)":
    case "C++11 (Clang)":
    case "C++14 (Clang)":
    case "C++17 (Clang)":
      return ".cc"
    case "C":
    case "C11":
    case "C (Clang)":
    case "C11 (Clang)":
      return ".c"
    case "Python 2":
    case "Python 3":
    case "PyPy2":
    case "PyPy3":
      return ".py"
    case "Go":
      return ".go"
    case "Rust":
      return ".rs"
    case "Kotlin (JVM)":
    case "Kotlin (Native)":
      return ".kt"
  }
}

async function zip_problems(username) {
  let zip = new JSZip();

  let problems = await get_problems(username);
  let problem_infos = get_problem_infos(problems)
  let solutions = get_solution_infos(problems, username);
  let sols = await solutions;
  let source = await get_source(sols.numbers);

  let result = zip.folder("algorithm");
  for (let i = 0; i < problems.length; ++i) {
    let number = await problems[i];
    let folder = result.folder(number);

    let language = await sols.language[i];
    let ext = language_to_extension(language);
    let content = await source[i];
    let filename = folder.file("main"+ext, content);

  }

  zip.generateAsync({type:"blob"})
    .then(function(content) {
      fileSaver.saveAs(content, "algoithm.zip");
      console.log(content)
      console.log("World")
    })
    .catch(err => {
      console.log(err);
      console.log("World");
    });
}

export {
  get_problems,
  get_problem_infos,
  get_solution_infos,
  get_source,
  zip_problems,
};