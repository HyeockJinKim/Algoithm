import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import GitHubIcon from '@material-ui/icons/GitHub';
import SaveIcon from '@material-ui/icons/Save';
import {boj_github, boj_zip} from "../utils/boj";
import {get_email, get_repos, Repo} from "../utils/github";
import Username from "./Username";
import Email from "./Email";
import Repository from "./Repository";
import Password from "./Password";

enum Site {
  None,
  Boj,
}

enum Mode {
  None,
  Username,
  Repo,
  Password,
  Email,
}

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  }
}));

function header(origin: Site, username: string | undefined) {
  if (chrome === undefined || chrome.storage === undefined) {
    console.log("No Chrome Extension");
    return;
  }

  switch (origin) {
    case Site.Boj:
      return (
        <div>
          <h2>Baekjoon Online Judge</h2>
          {username !== undefined ? <h3>{username} 님</h3> : <div/>}
        </div>
      );
    case Site.None:
    default:
      return <h3>No Algorithm Site</h3>;
  }
}

async function get_problem_function(origin: Site, username: string | undefined) {
  if (chrome === undefined || chrome.storage === undefined) {
    console.log("No Chrome Extension");
    return;
  }
  if (username === undefined) {
    console.log("로그인이 필요합니다.");
    return;
  }
  switch (origin) {
    case Site.Boj:
      await boj_zip(username);
      return;
    case Site.None:
    default:
      console.log("No Algorithm Site.");
      return;
  }
}

function MainPage() {
  const classes = useStyles();
  const [site, setSite] = useState<Site>(Site.None);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<Mode>(Mode.None);
  const [githubUsername, setGithubUsername] = useState('');
  const [githubPassword, setGithubPassword] = useState('');
  const [githubEmail, setGithubEmail] = useState<string>('');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [repo, setRepo] = useState<Repo | undefined>(undefined);

  if (chrome && chrome.storage) {
    chrome.storage.local.get('origin', data => {
      switch (data.origin) {
        case "Boj":
          if (site !== Site.Boj)
            setSite(Site.Boj);
          break;
        default:
          if (site !== Site.None)
            setSite(Site.None);
      }
    })
    chrome.storage.local.get('username', async data => {
      const _username = data.username;
      if (_username === undefined) {
        console.log("로그인이 필요합니다.");
        return;
      }
      setUsername(_username);
    });
  }

  function body() {
    switch (mode) {
      case Mode.None:
        return (
          <div/>
        )
      case Mode.Username:
        return (
          <Username username={githubUsername} setUsername={name => setGithubUsername(name)} nextStep={nextStep}/>
        )
      case Mode.Email:
        return (
          <Email email={githubEmail} setEmail={email => setGithubEmail(email)} nextStep={nextStep}/>
        )
      case Mode.Repo:
        return (
          <Repository repos={repos} setRepo={repo => setRepo(repo)} nextStep={nextStep}/>
        )
      case Mode.Password:
        return (
          <Password password={githubPassword} setPassword={pw => setGithubPassword(pw)} nextStep={nextStep}/>
        )
      default:
        throw new Error("Unreachable code");
    }
  }

  async function nextStep() {
    console.log(mode);
    switch (mode) {
      case Mode.None:
        return setMode(Mode.Username);
      case Mode.Username:
        const repos = await get_repos(githubUsername);
        console.log(repos);
        if (repos != null)
          setRepos(repos);
        return setMode(Mode.Repo);
      case Mode.Repo:
        return setMode(Mode.Password);
      case Mode.Password:
        const email = await get_email(githubUsername, githubPassword);
        if (email !== null)
          setGithubEmail(email);
        return setMode(Mode.Email);
      case Mode.Email:
        if (username !== undefined)
          await boj_github(username, {
            username: githubUsername,
            password: githubPassword,
            email: githubEmail,
            repo: repo?.name
          });
        return setMode(Mode.None);
      default:
        throw new Error("Unreachable code");
    }
  }

  return (
    <div>
      {header(site, username)}
      <div>
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          startIcon={<GitHubIcon/>}
          onClick={nextStep}>
          깃헙 업로드
        </Button>
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          startIcon={<SaveIcon/>}
          onClick={() => get_problem_function(site, username)}>
          다운로드
        </Button><br/>
        {body()}
      </div>
    </div>
  )
}

export default MainPage;