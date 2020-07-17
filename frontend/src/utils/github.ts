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

export type TreeItem = {
  path: string;
  sha: string;
  mode: string;
  type: string;
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

export function make_blob(config: UserConfig, content: string, path: string): Promise<TreeItem> {
  return fetch(` https://api.github.com/repos/${config.username}/${config.repo}/git/blobs`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: "Basic " + btoa(config.username + ":" + config.password),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: JSON.stringify({
      content,
      encoding: "utf-8"
    })
  }).then(x => x.json())
    .then(x => ({
      path,
      sha: x.sha,
      mode: "100644",
      type: "blob",
    }));
}

export function get_ref(config: UserConfig): Promise<string> {
  return fetch(`https://api.github.com/repos/${config.username}/${config.repo}/git/ref/heads/master`)
    .then(x => x.json())
    .then(x => x.object.sha);
}

export function make_tree(config: UserConfig, tree_items: TreeItem[], base_tree: string): Promise<string> {
  return fetch(`https://api.github.com/repos/${config.username}/${config.repo}/git/trees`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: "Basic " + btoa(config.username + ":" + config.password),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: JSON.stringify({
      tree: tree_items,
      base_tree
    })
  }).then(x => x.json())
    .then(x => x.sha);
}

export function make_commit(config: UserConfig, message: string, tree: string, parent: string): Promise<string> {
  return fetch(`https://api.github.com/repos/${config.username}/${config.repo}/git/commits`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: "Basic " + btoa(config.username + ":" + config.password),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: JSON.stringify({
      message,
      tree,
      parents: [parent]
    })
  }).then(x => x.json())
    .then(x => x.sha);
}

export function update_branch(config: UserConfig, ref: string) {
  return fetch(`https://api.github.com/repos/${config.username}/${config.repo}/git/refs/heads/master`, {
    method: "PATCH",
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: "Basic " + btoa(config.username + ":" + config.password),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: JSON.stringify({
      sha: ref
    })
  }).then(x => x.json());
}

export async function make_source_files(config: UserConfig, source: Source): Promise<TreeItem[]> {
  const path = `boj/${source.title}/${source.filename}`,
    readme_path = `boj/${source.title}/README.md`;

  return [
    await make_blob(config, source.source, path),
    await make_blob(config, source.readme, readme_path)
  ];
}

export async function get_email(username: string, password: string): Promise<string | null> {
  return await fetch(`https://api.github.com/users/${username}`, {
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
