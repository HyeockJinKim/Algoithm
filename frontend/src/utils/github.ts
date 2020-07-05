type UserConfig = {
  username: string;
  password: string;
  email: string | undefined;
  repo: string | undefined;
}

type Source = {
  title: string;
  filename: string;
  source: string;
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
  const branch_name = "algoithm";
  const branch_url = `https://api.github.com/repos/${config.username}/${config.repo}/git/ref/`;
  const basic = "Basic " + btoa(config.username + ":" + config.password);

  await delete_branch(branch_url, basic, branch_name);
  const master = await get_branch(branch_url, basic, "master").then(x => x.json());
  const headers = {
    Authorization: basic,
    "Content-Type": "application/x-www-form-urlencoded",
  }
  const body = JSON.stringify({
    ref: `refs/heads/${branch_name}`,
    sha: master.object.sha,
  });
  return await fetch(branch_url, {
    method: "POST",
    headers,
    body,
  });
}

export async function push_source(config: UserConfig, source: Source) {
  const branch_name = "algoithm";
  const path = `boj/${source.filename}`
  const branch_url = `https://api.github.com/repos/${config.username}/${config.repo}/contents/${path}`;

  const basic = "Basic " + btoa(config.username + ":" + config.password);
  const body = JSON.stringify({
    message: source.title,
    content: btoa(source.source),
    committer: {
      name: config.username,
      email: config.email,
    },
    branch: branch_name,
  });
  const headers = {
    Authorization: basic,
    "Content-Type": "application/x-www-form-urlencoded",
  }
  return await fetch(branch_url, {
    method: "POST",
    headers,
    body,
  });
}

export async function get_email(username: string, password: string): Promise<string | null> {
  const url = `https://api.github.com/users/${username}`
  const basic = "Basic " + btoa(username + ":" + password);
  const headers = {
    Authorization: basic,
    "Content-Type": "application/x-www-form-urlencoded",
  }
  return await fetch(url, {
    method: "GET",
    headers,
  }).then(x => x.json())
    .then(x => x.email);
}

export async function get_repos(username: string, password: string): Promise<any> {
  const url = `https://api.github.com/users/${username}/repos`
  const basic = "Basic " + btoa(username + ":" + password);
  const headers = {
    Authorization: basic,
    "Content-Type": "application/x-www-form-urlencoded",
  }
  return await fetch(url, {
    method: "GET",
    headers,
  }).then(x => x.json());
}
