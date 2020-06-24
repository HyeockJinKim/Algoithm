import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import GitHubIcon from '@material-ui/icons/GitHub';
import SaveIcon from '@material-ui/icons/Save';
import SettingsIcon from '@material-ui/icons/Settings';
import {boj_zip} from "../utils/boj";

enum Site {
  Boj,
  None,
}

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  }
}));

function header(origin: Site, username: string | undefined) {
  if (chrome === undefined || chrome.storage === undefined) {
    alert("No Chrome Extension");
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
    alert("No Chrome Extension");
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
      alert(document.location.origin);
      console.log("No Algorithm Site.");
      return ;
  }
}

function MainPage() {
  const classes = useStyles();
  const [site, setSite] = useState<Site>(Site.None);
  const [username, setUsername] = useState<string | undefined>(undefined);
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
          onClick={() => get_problem_function(site, username)}>
          깃헙 업로드
        </Button>
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          startIcon={<SaveIcon/>}
          onClick={() => get_problem_function(site, username)}>
          소스코드 다운로드
        </Button><br/>
        <Button className={classes.button} variant="outlined" startIcon={<SettingsIcon/>}>설정</Button>
      </div>
    </div>
  )
}

export default MainPage;