import React from 'react';
import Grid from '@mui/material/Grid';
import { getPastDate } from 'lib/dateUtils';
import ReferenceDateContext from 'modules/app/components/ReferenceDateContext';
import sensorConfig from 'modules/data/sensorConfig';

const SensorList = React.memo(() => {
  const currentDate = React.useContext(ReferenceDateContext);
  const [fromDate, setFromDate] = React.useState(getPastDate(10, 'minutes', currentDate));

  React.useEffect(() => {
    setFromDate(getPastDate(10, 'minutes', currentDate));
  }, [currentDate]);

  return (
    <Grid container direction="column" justifyContent="space-evenly">
      {sensorConfig.map(({ id, name, Component }) => (
        <Grid item key={id} sx={{ m: 2 }}>
          <Component title={name} fromDate={fromDate} />
        </Grid>
      ))}
    </Grid>
  );
});

export default SensorList;
