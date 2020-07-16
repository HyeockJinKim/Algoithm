export type UserConfig = {
  username: string;
  password: string;
  email: string | undefined;
  repo: string | undefined;
}

export type Source = {
  title: string;
  filename: string;
  source: string;
  readme: string;
};

export type Repo = {
  name: string;
  description: string | null;
}

async function delete_branch(branch_url: string, basic: string, branch_name: string): Promise<void> {
  await fetch(`${branch_url}/heads/${branch_name}`, {
    method: "DELETE",
    headers: {
      Authorization: basic,
      "Content-Type": "application/x-www-form-urlencoded",
    }
  });
}

async function get_branch(branch_url: string, basic: string, branch_name: string): Promise<Response> {
  return await fetch(`${branch_url}/heads/${branch_name}`, {
    method: "GET",
    headers: {
      Authorization: basic,
      "Content-Type": "application/x-www-form-urlencoded",
    }
  });
}

export async function new_algoithm_branch(config: UserConfig): Promise<Response> {
  const branch_name = "algoithm",
    delete_url = `https://api.github.com/repos/${config.username}/${config.repo}/git/ref`,
    branch_url = `https://api.github.com/repos/${config.username}/${config.repo}/git/refs`,
    basic = "Basic " + btoa(config.username + ":" + config.password);

  await delete_branch(branch_url, basic, branch_name);
  const master = await get_branch(branch_url, basic, "master")
    .then(x => x.json());
  return await fetch(branch_url, {
    method: "POST",
    headers: {
      Authorization: basic,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: JSON.stringify({
      ref: `refs/heads/${branch_name}`,
      sha: master.object.sha,
    }),
  });
}

async function push_file(config: UserConfig, msg: string, content: string, url: string) {
  await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: "Basic " + btoa(config.username + ":" + config.password),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: JSON.stringify({
      message: msg,
      content: btoa(unescape(encodeURIComponent(content))),
      committer: {
        name: config.username,
        email: config.email,
      },
      branch: "algoithm",
    }),
  });
}

export async function push_source(config: UserConfig, source: Source) {
  const path = `boj/${source.title}/${source.filename}`,
    readme_path = `boj/${source.title}/README.md`,
    branch_url = `https://api.github.com/repos/${config.username}/${config.repo}/contents/${path}`,
    readme_url = `https://api.github.com/repos/${config.username}/${config.repo}/contents/${readme_path}`;
  await push_file(config, source.title + " Problem Solved", source.readme, readme_url);
  await push_file(config, source.title + " Problem Solved", source.source, branch_url);
}

export async function get_email(username: string, password: string): Promise<string | null> {
  const url = `https://api.github.com/users/${username}`
  return await fetch(url, {
    method: "GET",
    headers: {
      Authorization: "Basic " + btoa(username + ":" + password),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).then(x => x.json())
    .then(x => x.email);
}

export async function get_repos(username: string): Promise<Repo[] | null> {
  const url = `https://api.github.com/users/${username}/repos`
  return await fetch(url)
    .then(x => x.json())
    .then(x => x instanceof Array ? x : null);
}
