import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import GitHubIcon from '@material-ui/icons/GitHub';
import SaveIcon from '@material-ui/icons/Save';
import {boj_zip} from "../utils/boj";
import {Input} from "@material-ui/core";
import {get_email, get_repos, push_source} from "../utils/github";

enum Site {
  None,
  Boj,
}

enum Mode {
  None,
  Github,
  Email,
  Repo,
}

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
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
  const [githubEmail, setGithubEmail] = useState<string | undefined>(undefined);
  const [repos, setRepos] = useState<any[]>([]);
  const [repo, setRepo] = useState<string | undefined>(undefined);

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

  async function upload_github() {
    if (githubEmail === undefined) {
      const email = await get_email(githubUsername, githubPassword);
      if (email === null) {
        setMode(Mode.Email);
        return;
      }
      setGithubEmail(email);
    }
    if (repo === undefined) {
      const repos = await get_repos(githubUsername, githubPassword);
      if (repos instanceof Array) {
        setRepos(repos);
        setMode(Mode.Repo);
      } else {
        return;
      }
    }

    // push_source({username: githubUsername, password: githubPassword, email: githubEmail, repo}, {})
  }

  const head = header(site, username);

  return (
    <div>
      {head}
      <div>
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          startIcon={<GitHubIcon/>}
          onClick={() => mode === Mode.Github ? setMode(Mode.None) : setMode(Mode.Github)}>
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
        {
          mode === Mode.Github ? (
            <div>
              <Input value={githubUsername} onChange={e => setGithubUsername(e.target.value)} placeholder="Github ID"/>
              <Input value={githubPassword} onChange={e => setGithubPassword(e.target.value)} placeholder="Github Password"/>
              <Button onClick={upload_github}/>
            </div>
          ) : (
            <div/>
          )
        }
        {
          mode === Mode.Email ? (
            <div>
              <Input value={githubEmail} onChange={e => setGithubEmail(e.target.value)} placeholder="Github Email"/>
              <Button onClick={upload_github}/>
            </div>
          ) : (
            <div/>
          )
        }
        {
          mode === Mode.Repo ? (
            <div>
              {
                repos.map(r => (
                  <Card>

                  </Card>
                ))
              }
            </div>
          ) : (
            <div/>
          )
        }
      </div>
    </div>
  )
}

export default MainPage;