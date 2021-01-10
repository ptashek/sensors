// @flow
import type { ComponentType } from 'react';
import React from 'react';
import classnames from 'classnames';
import { LinearProgress, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

type ContentWrapperProps = {
  children: React$Node,
  className?: string,
  ...any,
};

type LoadingProps = {
  children: React$Node,
};

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
  },
  loading: {
    zIndex: theme.zIndex.modal,
    opacity: 0.5,
  },
}));

const ContentWrapper = React.memo<ContentWrapperProps, typeof Paper>(
  ({ children, className, ...paperProps }) => {
    const classes = useStyles();

    return (
      <Paper elevation={1} className={classnames(classes.root, className)} {...paperProps}>
        {children}
      </Paper>
    );
  },
);

export const Loading = React.memo<LoadingProps, typeof Paper>(({ children }) => {
  const classes = useStyles();
  return (
    <Paper elevation={0} className={classes.loading}>
      {children}
      <LinearProgress variant="query" />
    </Paper>
  );
});

export default ContentWrapper;
