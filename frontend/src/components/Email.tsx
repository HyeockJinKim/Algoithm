import React from 'react';
import {Input} from "@material-ui/core";
import Button from "@material-ui/core/Button";

type EmailProps = {
  email: string | undefined;
  setEmail: (name: string) => void;
  nextStep: () => void;
}

function Email({email, setEmail, nextStep}: EmailProps) {

  return (
    <div>
      <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Github Email"/>
      <Button onClick={nextStep}>이메일 등록</Button>
    </div>
  )
}

export default Email;
