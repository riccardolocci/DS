import React from 'react';

import NavBar from './components/NavBar';
import LPP from './components/LPP';

import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import { makeStyles, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => createStyles({
  root: {
    textAlign: 'center'
  },
  logo: {
    height: '40vmin'
  },
  header: {
    backgroundColor: '#282c34',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'calc(10px + 2vmin)',
    color: 'white'
  },
  link: {
    color: '#09d3ac'
  },
  top: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%'
  },
  container: {
    flexGrow: 1,
    zIndex: 1,
    minWidth: 0,
    height: '100vh',
    marginTop: 65
  },
  centerPane: {
    flexGrow: 1,
    height: '100%'
  }
}));

let App = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div>
        <Router basename="/DS">
          <div className={classes.top}>
            <NavBar />
            <main className={classes.container}>
              <div className={classes.centerPane}>
                <Switch>
                  <Route
                    exact path="/"
                    component={LPP}
                  />
                </Switch>
              </div>
            </main>
          </div>
        </Router>
      </div>
    </div>
  );
}

export default App;
