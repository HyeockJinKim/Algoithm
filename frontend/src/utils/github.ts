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
    branch_url = `https://api.github.com/repos/${config.username}/${config.repo}/git/ref/`,
    basic = "Basic " + btoa(config.username + ":" + config.password);

  await delete_branch(branch_url, basic, branch_name);
  const master = await get_branch(branch_url, basic, "master").then(x => x.json()),
    body = JSON.stringify({
    ref: `refs/heads/${branch_name}`,
    sha: master.object.sha,
  });
  return await fetch(branch_url, {
    method: "POST",
    headers: {
      Authorization: basic,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
}

export async function push_source(config: UserConfig, source: Source) {
  const branch_name = "algoithm";
  const path = `boj/${source.filename}`
  const branch_url = `https://api.github.com/repos/${config.username}/${config.repo}/contents/${path}`;

  const body = JSON.stringify({
    message: source.title,
    content: btoa(source.source),
    committer: {
      name: config.username,
      email: config.email,
    },
    branch: branch_name,
  });

  return await fetch(branch_url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(config.username + ":" + config.password),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
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

export async function get_repos(username: string, password: string): Promise<any> {
  const url = `https://api.github.com/users/${username}/repos`
  return await fetch(url, {
    method: "GET",
    headers: {
      Authorization: "Basic " + btoa(username + ":" + password),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).then(x => x.json());
}
