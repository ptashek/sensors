import React from 'react';
import { useLocation } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import { formatDate } from 'lib/dateUtils';

const StyledLink = React.memo((props) => {
  const { children, ...linkProps } = props;

  return (
    <Link {...linkProps} color="primary" variant="body2">
      <strong>{children}</strong>
    </Link>
  );
});

const SensorData = (props) => {
  const { sensor, title, dt, children } = props;
  const dateString = formatDate(new Date(dt));
  const { pathname } = useLocation();

  return (
    <Paper
      elevation={pathname.startsWith(`/sensor/${sensor}/`) ? 4 : 1}
      sx={{
        p: 2,
        maxHeight: (theme) => `calc(100vh - ${theme.spacing(10)})`,
        overflowY: 'auto',
      }}
    >
      <Typography variant="h6" align="center">
        <strong>{title}</strong>
      </Typography>
      <Typography variant="body1" align="center">
        <strong>{dateString}</strong>
      </Typography>
      <Divider />
      <Typography variant="subtitle2" component="div">
        {children}
        <Divider />
        <Grid container spacing={2}>
          <Grid item>
            <StyledLink href={`/#/sensor/${sensor}/chart`}>Chart</StyledLink>
          </Grid>
          <Grid item>
            <StyledLink href={`/#/sensor/${sensor}/table`}>Table</StyledLink>
          </Grid>
        </Grid>
      </Typography>
    </Paper>
  );
};

export default React.memo(SensorData);
