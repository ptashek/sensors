import React from 'react';
import MUIAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SpeedIcon from '@mui/icons-material/Speed';
import Link from '@mui/material/Link';

const forceReload = () => window.location.reload(true);

const AppBar = () => {
  return (
    <MUIAppBar position="sticky" sx={{ flexGrow: 1 }}>
      <Toolbar variant="dense">
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={forceReload}
          sx={{ mr: 2 }}
        >
          <SpeedIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }} noWrap>
          Sensors
        </Typography>
        <Typography variant="body2">
          <Link href="https://openweathermap.org/" color="inherit" rel="noopener" target="_blank">
            Powered by OpenWeatherMap
          </Link>
        </Typography>
      </Toolbar>
    </MUIAppBar>
  );
};

export default React.memo(AppBar);
