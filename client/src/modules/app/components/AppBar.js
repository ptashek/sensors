// @flow
import type { ComponentType } from 'react';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MUIAppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import SpeedIcon from '@material-ui/icons/Speed';
import Link from '@material-ui/core/Link';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const forceReload: () => void = () => window.location.reload(true);

const AppBar = React.memo<void, typeof MUIAppBar>(() => {
  const classes = useStyles();

  return (
    <MUIAppBar className={classes.root} position="sticky">
      <Toolbar variant="dense">
        <IconButton
          edge="start"
          className={classes.menuButton}
          color="inherit"
          aria-label="menu"
          onClick={forceReload}
        >
          <SpeedIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title} noWrap>
          Sensors
        </Typography>
        <Typography variant="body2">
          <Link
            href="https://darksky.net/poweredby/"
            color="inherit"
            rel="noopener"
            target="_blank"
          >
            Powered by Dark Sky
          </Link>
        </Typography>
      </Toolbar>
    </MUIAppBar>
  );
});

export default AppBar;
