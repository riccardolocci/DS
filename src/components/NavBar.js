import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { Typography } from '@material-ui/core/';

import { makeStyles, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => createStyles({
  appBar: {
    zIndex: 10,
    paddingLeft: 0
  },
  spacer: {
    width: 20
  },
  toolbar: {
    margin: 0,
    paddingLeft: "10px !important"
  }
}));

let NavBar = () => {
  const classes = useStyles();
    
  return(
    <AppBar position="absolute" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
          <span className={classes.spacer}/>
          <Typography variant="h6" color="inherit" className={classes.typography}>
              DECISION SCIENCE
          </Typography>
      </Toolbar>
    </AppBar>
  ) 
}

export default NavBar;