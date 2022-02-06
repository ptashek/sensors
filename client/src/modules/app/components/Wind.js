import React from 'react';
import { styled } from '@mui/material/styles';
import { Grid } from '@mui/material';

const DirectionArrow = styled('div')(
  ({ bearing }) => `
  transition: transform 300ms ease-in-out;
  transform: rotate(${bearing - 90}deg);
`,
);

const Wind = ({ bearing, speed, unit = 'km/h' }) => (
  <Grid container item direction="row" spacing={1} xs={4} alignItems="center"
    justifyContent="center">
    <Grid item>
      <DirectionArrow bearing={bearing}>&#10137;</DirectionArrow>
    </Grid>
    <Grid item>
      {speed}&nbsp;{unit}
    </Grid>
  </Grid>
);

export default React.memo(Wind);
