import React from 'react';
import { Grid } from '@mui/material';

const CloudCover = ({ ratio }) => (
  <Grid
    container
    item
    direction="row"
    alignItems="center"
    justifyContent="center"
    xs={4}
    spacing={1}
  >
    <Grid item>&#9729;</Grid>
    <Grid item>{ratio}%</Grid>
  </Grid>
);

export default React.memo(CloudCover);
