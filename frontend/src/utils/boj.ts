import {get_first_row, get_html, get_cell_index, get_url, get_text_from_id} from "./request";
import {boj_language_to_language, language_to_extension} from "./language";
import {
  new_algoithm_branch,
  make_source_files,
  UserConfig,
  get_ref,
  make_tree,
  TreeItem,
  make_commit,
  update_branch, make_blob
} from "./github";

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
  return get_html('https://www.acmicpc.net/user/' + username)
    .then(html => html.getElementsByClassName('panel-body')[0])
    .then(span => span.getElementsByClassName('problem_number'))
    .then(collections => Array.from(collections))
    .then(arr => arr.map(name => name.textContent!));
}

/**
 * 특정 문제의 정보를 가져오는 함수
 * @param number: 풀었던 문제 번호
 * @returns 문제 정보
 */
function get_problem_info(number: string): Promise<Problem> {
  return get_html('https://www.acmicpc.net/problem/' + number)
    .then(html => {
      const info = get_first_row(html, 'problem-info');
      return {
        number,
        title: get_text_from_id(html, 'problem_title'),
        description: get_text_from_id(html, 'problem_description'),
        input: get_text_from_id(html, 'problem_input'),
        output: get_text_from_id(html, 'problem_output'),
        limit_time: info[0].textContent!,
        limit_memory: info[1].textContent!,
      };
    });
}

/**
 * 유저가 풀었던 답의 소스코드를 가져오는 함수
 * @param solution: 제출한 소스 코드 번호
 * @returns 소스 코드
 */
function get_source(solution: string): Promise<string> {
  return get_url('https://www.acmicpc.net/source/download/' + solution);
}

/**
 * 유저가 풀었던 답의 정보를 가져오는 함수
 * @param problem: 문제 번호
 * @param username: 백준 아이디
 * @returns Solution
 */
function get_solution_info(problem: string, username: string): Promise<Solution> {
  return get_html('https://www.acmicpc.net/status?from_mine=1&problem_id=' + problem + '&user_id=' + username)
    .then(html => get_first_row(html, 'status-table'))
    .then(info => {
      const language = get_cell_index(info, 6).split('/')[0].trim();
      return {
        number: get_cell_index(info, 0),
        success: get_cell_index(info, 3),
        memory: get_cell_index(info, 4),
        time: get_cell_index(info, 5),
        language: get_cell_index(info, 6).split('/')[0].trim(),
        extension: language_to_extension(language),
        length: get_cell_index(info, 7)
      }
    })
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

function root_readme(language_count: { [key: string]: number }): string {
  const base = "# 알고리즘 문제 소스 코드 정리\n\n" +
    "> by [Algoithm](https://github.com/HyeockJinKim/Algoithm)\n\n" +
    "## 사용 언어\n\n";

  return Object.keys(language_count)
    .map(key => {
      return {count: language_count[key], language: key};
    })
    .sort((a, b) => b.count - a.count)
    .reduce((init, lang) => init +
      `### ${lang.language}\n\n` +
      `> ${lang.count} 개\n\n`, base);
}

async function get_boj_source(username: string, language_count: { [key: string]: number }) {
  const problems = await get_problems(username);

  return problems.map(async problem => {
    const problem_info = await get_problem_info(problem),
      solution_info = await get_solution_info(problem, username),
      source = await get_source(solution_info.number),
      language = boj_language_to_language(solution_info.language);
    language_count[language] = language_count[language] === undefined ? 1 : language_count[language] + 1;
    return {
      title: problem,
      filename: "main" + solution_info.extension,
      source,
      readme: readme(problem_info, solution_info)
    }
  });
}

/**
 * 풀었던 문제들을 파싱해서 zip 압축파일로 저장하는 함수
 * @param username: 백준 id
 * @returns {Promise<void>}
 */
export async function boj_zip(username: string) {
  const language_count = {},
    zip = new JSZip(),
    root = zip.folder("algorithm"),
    boj_folder = root.folder("boj");
  await get_boj_source(username, language_count)
    .then(sources => Promise.all(sources.map(res =>
      res.then(source => {
        const folder = boj_folder.folder(source.title);
        folder.file(source.filename, source.source);
        folder.file("README.md", source.readme);
      })))
      .then(_ => {
        root.file("README.md", root_readme(language_count));
        zip.generateAsync({type: "blob"})
          .then((content: Blob) => fileSaver.saveAs(content, "algorithm.zip"));
      }));
}

export async function boj_github(username: string, config: UserConfig) {
  const language_count = {},
    tree_items: TreeItem[][] = [],
    ref = await get_ref(config),
    tree = await get_boj_source(username, language_count)
    .then(sources => Promise.all(
      sources.map(res =>
        res.then(async source => tree_items.push(await make_source_files(config, source))))
    ).then(async _ => tree_items.push([await make_blob(config, root_readme(language_count), "README.md")])))
    .then(_ => make_tree(config, tree_items.flatMap(x => x), ref));
  const commit = await make_commit(config, `Boj ${(tree_items.length-1) / 2} problem Solved`, tree, ref)
    .then(commit => update_branch(config, commit));
  console.log(commit);
}
