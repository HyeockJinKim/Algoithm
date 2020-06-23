import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import SettingsIcon from '@material-ui/icons/Settings';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  }
}));

function header() {
  switch (document.location.origin) {
    case "https://www.acmicpc.net":
      return (
        <div>
          <h2>Baekjoon Online Judge</h2>
        </div>
      );
    default:
      return <h3>No Algorithm Site</h3>;
  }
}
function MainPage() {
  const classes = useStyles();
  const head = header();

  return (
    <div>
      {head}
      <div>
        <Button className={classes.button} variant="contained" color="primary" startIcon={<SaveIcon />}>소스코드 다운로드</Button>
        <Button className={classes.button} variant="outlined" startIcon={<SettingsIcon/>}>설정</Button>
      </div>
    </div>
  )
}

export default MainPage;