import {get_first_row, get_html, get_cell_index, get_url, get_text_from_id} from "./request";
import {language_to_extension} from "./language";
const JSZip = require(`jszip`);
const fileSaver = require(`file-saver`);

type Problem = {
  number: string;
  title: string;
  description: string;
  input: string;
  output: string;
  limit_time: string;
  limit_memory: string;
}

type Solution = {
  number: string;
  success: string;
  memory: string;
  time: string;
  language: string;
  extension: string;
  length: string;
}

/**
 * user가 푼 백준의 문제 리스트를 가져오는 함수
 * @param username: 백준 아이디
 * @returns {Promise<string[]>}
 */
async function get_problems(username: string): Promise<string[]> {
  const html = await get_html('https://www.acmicpc.net/user/'+username);
  const problems = html.getElementsByClassName('panel-body')[0]
    .getElementsByClassName('problem_number');
  return Array.from(problems).map(name => name.textContent!);
}

/**
 * 특정 문제의 정보를 가져오는 함수
 * @param problems: 풀었던 문제 번호 List
 * @returns 문제 정보
 */
function get_problem_infos(problems: string[]): Promise<Problem>[] {
  return problems
    .map(async number => {
      const html = await get_html('https://www.acmicpc.net/problem/'+number);
      const title = get_text_from_id(html, 'problem_title');
      const description = get_text_from_id(html, 'problem_description');
      const input = get_text_from_id(html, 'problem_input');
      const output = get_text_from_id(html, 'problem_output');
      const info = get_first_row(html, 'problem-info');
      const limit_time = info[0].textContent!;
      const limit_memory = info[1].textContent!;

      return {
        number,
        title,
        description,
        input,
        output,
        limit_time,
        limit_memory,
      }
    });
}

/**
 * 유저가 풀었던 답의 소스코드를 가져오는 함수
 * @param solutions: 제출한 소스 코드 번호
 * @returns 소스 코드 []
 */
function get_source(solutions: Promise<string>[]): Promise<string>[] {
  return solutions.map(async solution => {
    let url = await solution;
    return await get_url('https://www.acmicpc.net/source/download/' + url);
  });
}

/**
 * 유저가 풀었던 답의 정보를 가져오는 함수
 * @param problems: 문제 번호[]
 * @param username: 백준 아이디
 * @returns Solution
 */
function get_solution_infos(problems: string[], username: string): Promise<Solution>[] {
  return problems
    .map(problem => get_html('https://www.acmicpc.net/status?from_mine=1&problem_id='+problem+'&user_id='+username))
    .map(async _html => {
      const html = await _html;
      const infos = get_first_row(html, 'status-table');

      const number = get_cell_index(infos, 0);
      const success = get_cell_index(infos, 3);
      const memory = get_cell_index(infos, 4);
      const time = get_cell_index(infos, 5);
      const language = get_cell_index(infos, 6).split('/')[0].trim();
      const extension = language_to_extension(language);
      const length = get_cell_index(infos, 7);

      return {
        number,
        success,
        memory,
        time,
        language,
        extension,
        length,
      }
    });
}

/**
 * 문제를 풀었던 정보를 README 로 작성하는 함수
 * @param problem: 문제 정보 dictionary
 * @param solution
 * @returns {Promise<string>}: README
 */
function readme(problem: Problem, solution: Solution): string {
  // make README
  return `# ${problem.title}\n\n
#### 시간 제한\n\n
> ${problem.limit_time}\n\n
#### 메모리 제한\n\n
> ${problem.limit_memory}\n\n
### 문제 내용\n\n
${problem.description}\n\n
### 입력\n\n
${problem.input}\n\n
### 출력\n\n
${problem.output}\n\n
> 이 문제는 [Boj ${problem.number}번 문제](https://www.acmicpc.net/problem/${problem.number})입니다.\n\n
## Solution\n\n
### [${solution.language} Solution](./main${solution.extension})\n\n
#### 걸린 시간\n\n
> ${solution.time} ms\n\n
#### 사용한 메모리\n\n
> ${solution.memory} KB\n\n
#### 코드 Byte\n\n
> ${solution.length} Byte\n`
}

/**
 * 풀었던 문제들을 파싱해서 zip 압축파일로 저장하는 함수
 * @param username: 백준 id
 * @returns {Promise<void>}
 */
export async function boj_zip(username: string) {
  let zip = new JSZip();

  const problems = await get_problems(username);
  const problem_infos = get_problem_infos(problems);
  const solution_infos = get_solution_infos(problems, username);
  const solution_numbers = solution_infos.map(solution => solution.then(sol => sol.number));
  const source_list = get_source(solution_numbers);

  const root = zip.folder("algorithm");
  const boj_folder = root.folder("boj");
  const language_count: {[key: string]: number} = {};
  for (let i = 0; i < problems.length; ++i) {
    const problem = await problem_infos[i];
    const solution = await solution_infos[i];
    const source = await source_list[i];
    const filename = "main"+solution.extension;
    if (language_count[solution.language] === undefined)
      language_count[solution.language] = 0;
    language_count[solution.language] += 1;
    // README
    let readme_file = await readme(problem, solution);
    let folder = boj_folder.folder(problem.number);
    folder.file(filename, source);
    folder.file("README.md", readme_file);
  }
  let root_readme = "# 알고리즘 문제 소스 코드 정리\n\n" +
    "> by [Algoithm](https://github.com/HyeockJinKim/Algoithm)\n\n" +
    "## 사용 언어\n\n";

  root_readme = Object.keys(language_count)
    .map(key => {
      return {count: language_count[key], language: key};
    })
    .sort((a, b) => b.count - a.count)
    .reduce((init, lang) => init +
      `### ${lang.language}\n\n`+
      `> ${lang.count} 개\n\n`, root_readme);

  root.file("README.md", root_readme);
  zip.generateAsync({type:"blob"})
    .then((content: Blob) => fileSaver.saveAs(content, "algorithm.zip"));
}
