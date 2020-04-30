const JSZip = require(`jszip`);
const fileSaver = require(`file-saver`);

/**
 * url에 요청한 값을 그대로 읽음
 * @param url: 요청할 url
 * @returns {Promise<string>}: Promise<요청 데이터>
 */
let get_url = (url) => fetch(url).then(data => data.text());

/**
 * url에 요청한 값을 html로 읽음
 * @param url: 요청할 url
 * @returns {Promise<Document>}: Promise<요청 html>
 */
let get_html = (url) => get_url(url).then(html => new DOMParser().parseFromString(html, "text/html"));

/**
 * ul 태그의 값 중 특정 index의 값을 읽는 함수
 * @param infos: ul 값을 저장한 list
 * @param index: 읽으려는 index
 * @returns [Promise<string>, ...]
 */
let get_text_index = (infos, index) => infos.map(async data => {
  let cell = await data;
  return cell[index].textContent.trim();
});

/**
 * html 중 특정 id 태그의 Text content 값을 읽어 오는 함수
 * @param problem_infos: 백준 문제 정보들
 * @param keyword: 값을 읽으려는 태그의 id
 * @returns [Promise<string>, ...]
 */
let get_text_of_keyword = (problem_infos, keyword) => problem_infos.map(async data => {
  let html = await data;
  let content = html.getElementById(keyword);
  return content != null ? html.getElementById(keyword).textContent.trim() : '';
});

/**
 * Table 중 헤더를 제외한 첫번째 row 값을 읽어오는 함수
 * @param problem_infos: 요청한 Promise<html> list
 * @param keyword: 읽으려는 table의 id
 * @returns [Promise<li Tag>, ...]
 */
let get_first_row = (problem_infos, keyword) => problem_infos.map(async data => {
  let html = await data;
  return html.getElementById(keyword).rows[1].cells;
});

/**
 * user가 푼 백준의 문제 리스트를 가져오는 함수
 * @param username: 백준 아이디
 * @returns {Promise<string[]>}
 */
async function get_problems(username) {
  let html = await get_html('https://www.acmicpc.net/user/'+username);
  let problems = html.getElementsByClassName('panel-body')[0]
    .getElementsByClassName('problem_number');

  return [...problems].map(name => name.textContent);
}

/**
 * 특정 문제의 정보를 가져오는 함수
 * @param problems: 풀었던 문제 번호 List
 * @returns {Promise<{outputs: Promise<string>[], inputs: Promise<string>[], titles: Promise<string>[], descriptions: Promise<string>[], infos: Promise<li, Tag>[]}>}
 */
async function get_problem_infos(problems) {
  let problem_infos = problems.map(async problem => await get_html('https://www.acmicpc.net/problem/'+problem));

  let titles = get_text_of_keyword(problem_infos, 'problem_title');
  let descriptions = get_text_of_keyword(problem_infos, 'problem_description');
  let inputs = get_text_of_keyword(problem_infos, 'problem_input');
  let outputs = get_text_of_keyword(problem_infos, 'problem_output');

  let infos = get_first_row(problem_infos, 'problem-info');

  return {
    titles,
    descriptions,
    inputs,
    outputs,
    infos,
  }
}

/**
 * 유저가 풀었던 답의 정보를 가져오는 함수
 * @param problems: 문제 번호
 * @param username: 백준 아이디
 * @returns {Promise<{memory: Promise<string>[], success: Promise<string>[], numbers: Promise<string>[], length: Promise<string>[], language: string[], time: Promise<string>[]}>}
 */
async function get_solution_infos(problems, username) {
  let solution = problems.map(async problem =>
    await get_html('https://www.acmicpc.net/status?from_mine=1&problem_id='+problem+'&user_id='+username));

  let infos = get_first_row(solution, 'status-table');
  let numbers = get_text_index(infos, 0);
  let success = get_text_index(infos, 3);
  let memory = get_text_index(infos, 4);
  let time = get_text_index(infos, 5);
  let language = infos.map(async info => {
    let temp = await info;
    return temp[6].textContent.split('/')[0].trim()
  });
  let length = get_text_index(infos, 7);

  return {
    numbers,
    success,
    memory,
    time,
    language,
    length,
  }
}

/**
 * 유저가 풀었던 답의 소스코드를 가져오는 함수
 * @param solutions: 제출한 소스 코드 번호
 * @returns {Promise<source code>}
 */
async function get_source(solutions) {
  return solutions.map(async solution => {
    let url = await solution;
    return await get_url('https://www.acmicpc.net/source/download/' + url)
  });
}

/**
 * 언어에 따른 확장자를 구하는 함수
 * @param language: 프로그래밍 언어
 * @returns {string}: 확장자
 */
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

/**
 * 확장자에서 풀었던 언어 정보를 가져오는 함수
 * @param extension: 확장자
 * @returns {string}: 풀었던 언어 정보
 */
function extension_to_language(extension) {
  switch (extension) {
    case ".java":
      return "Java Language Solution";
    case ".cc":
      return "C++ Language Solution";
    case ".c":
      return "C Language Solution";
    case ".py":
      return "Python Language Solution";
    case ".go":
      return "Go Language Solution";
    case ".rs":
      return "Rust Language Solution";
    case ".kt":
      return "Kotlin Language Solution";
  }
}

/**
 * 문제를 풀었던 정보를 README 로 작성하는 함수
 * @param problem_infos: 문제 정보 dictionary
 * @param language: 언어
 * @param ext: 확장자
 * @param sols: 문제 solution 정보 dictionary
 * @param number: 백준 문제 번호
 * @param i: 풀었던 문제들 중 몇번째 인지
 * @returns {Promise<string>}: README
 */
async function readme(problem_infos, language, ext, sols, number, i) {
  // problem info
  let title = await problem_infos.titles[i];
  let infos = await problem_infos.infos[i];
  let limit_time = infos[0].textContent;
  let limit_memory = infos[1].textContent;
  let description = await problem_infos.descriptions[i];
  let input = await problem_infos.inputs[i];
  let output = await problem_infos.outputs[i];

  // solution info
  let time = await sols.time[i];
  let memory = await sols.memory[i];
  let length = await sols.length[i];

  // make README
  return `# ${title}\n\n
#### 시간 제한\n\n
> ${limit_time}\n\n
#### 메모리 제한\n\n
> ${limit_memory}\n\n
### 문제 내용\n\n
${description}\n\n
### 입력\n\n
${input}\n\n
### 출력\n\n
${output}\n\n
> 이 문제는 [Boj ${number}번 문제](https://www.acmicpc.net/problem/${number})입니다.\n\n
## Solution\n\n
### [${language}](./main${ext})\n\n
#### 걸린 시간\n\n
> ${time} ms\n\n
#### 사용한 메모리\n\n
> ${memory} KB\n\n
#### 코드 Byte\n\n
> ${length} Byte\n`
}

/**
 * 풀었던 문제들을 파싱해서 zip 압축파일로 저장하는 함수
 * @param username: 백준 id
 * @returns {Promise<void>}
 */
async function zip_problems(username) {
  let zip = new JSZip();

  let problems = await get_problems(username);
  let problem_infos = await get_problem_infos(problems)
  let sols = await get_solution_infos(problems, username);
  let source = await get_source(sols.numbers);

  let root = zip.folder("algorithm");
  let boj_folder = root.folder("boj");
  let language_count = {};
  for (let i = 0; i < problems.length; ++i) {
    let number = await problems[i];

    // source code
    let language = await sols.language[i];
    let ext = language_to_extension(language);
    let content = await source[i];
    let filename = "main"+ext;
    language = extension_to_language(ext);
    if (language_count[language] === undefined)
      language_count[language] = 0;
    language_count[language] += 1;
    // README
    let readme_file = await readme(problem_infos, language, ext, sols, number, i);
    let folder = boj_folder.folder(number);
    folder.file(filename, content);
    folder.file("README.md", readme_file);
  }
  let root_readme = "# 알고리즘 문제 소스 코드 정리\n\n" +
    "> by [Algoithm](https://github.com/HyeockJinKim/Algoithm)\n\n" +
    "## 사용 언어\n\n";

  root_readme = Object.keys(language_count)
                .map(key => [language_count[key], key])
                .sort((a, b) => b[0] - a[0])
                .reduce((init, lang) => init +
                  `### ${lang[1]}\n\n`+
                  `> ${lang[0]} 개\n\n`, root_readme);

  root.file("README.md", root_readme);
  zip.generateAsync({type:"blob"})
    .then(content => fileSaver.saveAs(content, "algorithm.zip"));
}

export {
  zip_problems,
};
