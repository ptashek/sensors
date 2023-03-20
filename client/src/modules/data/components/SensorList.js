import React from 'react';
import { Grid, Typography } from '@mui/material';
import { getPastDate } from 'lib/dateUtils';
import ReferenceDateContext from 'modules/app/components/ReferenceDateContext';
import sensorConfig from 'modules/data/sensorConfig';

const TREND_DATA_MINUTES = 30;

const SensorList = () => {
  const currentDate = React.useContext(ReferenceDateContext);
  const [fromDate, setFromDate] = React.useState(getPastDate(TREND_DATA_MINUTES, 'minutes', currentDate));

  React.useEffect(() => {
    setFromDate(getPastDate(TREND_DATA_MINUTES, 'minutes', currentDate));
  }, [currentDate]);

  return (
    <Grid container direction="column" justifyContent="space-evenly">
      <Grid item sx={{ m: 2 }}>
        <Typography variant="caption">
          Trend data is calculated over the last {TREND_DATA_MINUTES} minutes.
          The table view shows the latest available data.
          The chart view shows aggregated averages.
        </Typography>
      </Grid>
      {sensorConfig.map(({ id, name, Component }) => (
        <Grid item key={id} sx={{ m: 2 }}>
          <Component title={name} fromDate={fromDate} />
        </Grid>
      ))}
    </Grid>
  );
};

export default React.memo(SensorList);
