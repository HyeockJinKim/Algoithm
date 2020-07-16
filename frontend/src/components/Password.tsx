import React from 'react';
import {Input} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/core/styles";

type PasswordProps = {
  password: string;
  setPassword: (pw: string) => void;
  nextStep: () => void;
}

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  }
}));

function Password({password, setPassword, nextStep}: PasswordProps) {
  const classes = useStyles();

  return (
    <div>
      <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Github Password"/>
      <Button className={classes.button} onClick={nextStep} variant="outlined">깃헙 PR</Button>
    </div>
  )
}

export default Password;
