import React from 'react';
import { Grid } from '@mui/material';

const Precipitation = ({ kind, intensity }) => {
  let data = '---';
  let icon = null;

  switch (kind) {
    default:
      break;

    case 'rain':
      icon = '☂';
      data = `${intensity} mm/h`;
      break;

    case 'snow':
      icon = '❄';
      data = `${intensity} mm/h`;
      break;
  }

  return (
    <Grid
      container
      item
      direction="row"
      spacing={1}
      xs={4}
      alignItems="center"
      justifyContent="center"
    >
      <Grid item>{icon}</Grid>
      <Grid item>{data}</Grid>
    </Grid>
  );
};

export default React.memo(Precipitation);
