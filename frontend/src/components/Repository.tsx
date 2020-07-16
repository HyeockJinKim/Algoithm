import React from 'react';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import {makeStyles} from "@material-ui/core/styles";
import {Repo} from "../utils/github";

type RepositoryProps = {
  repos: Repo[];
  setRepo: (repo: Repo) => void;
  nextStep: () => void;
}

const useStyles = makeStyles((theme) => ({
  container: {
    width: "350px",
    padding: "10px",
    maxHeight: 200,
    overflowY: "auto"
  },
  content: {
    width: "340px",
    height: "100px",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    border: "1px solid #e1e4e8",
    borderRadius: "6px",
    cursor: "pointer",
    margin: theme.spacing(1),
  },
}));

function Repository({repos, setRepo, nextStep}: RepositoryProps) {
  const classes = useStyles();

  return (
    <List className={classes.container}>
      {
        repos.map((repo, index) => (
          <ListItem className={classes.content} key={index} button onClick={() => {setRepo(repo); nextStep();}}>
            <ListItemText
              id={"repo-head-" + index}
              primary={repo.name}
              secondary={
                repo.description !== null ? <React.Fragment>
                  <Typography
                    component="span"
                    variant="body2"
                    color="textPrimary">
                    {repo.description}
                  </Typography>
                </React.Fragment> : undefined
              }/>
          </ListItem>
        ))
      }
    </List>
  )
}

export default Repository;
