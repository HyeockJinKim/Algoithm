import React from 'react';
import {Input} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/core/styles";

type UsernameProps = {
  username: string;
  setUsername: (name: string) => void;
  nextStep: () => void;
}

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  }
}));

function Username({username, setUsername, nextStep}: UsernameProps) {
  const classes = useStyles();

  return (
    <div>
      <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Github ID"/>
      <Button className={classes.button} onClick={nextStep} variant="outlined">Repository 가져오기</Button>
    </div>
  )
}

export default Username;
