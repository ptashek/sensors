import React from 'react';
import Grid from '@mui/material/Grid';
import { getPastTimestamp } from 'lib/utils';
import TimestampContext from 'modules/app/components/TimestampContext';
import sensorConfig from 'modules/data/sensorConfig';

const SensorList = React.memo(() => {
  const timestamp = React.useContext(TimestampContext);
  const [start, setStart] = React.useState(
    getPastTimestamp(10, 'minutes', { startFrom: timestamp }),
  );

  React.useEffect(() => {
    setStart(getPastTimestamp(10, 'minutes', { startFrom: timestamp }));
  }, [timestamp]);

  return (
    <Grid container direction="column" justifyContent="space-evenly">
      {sensorConfig.map(({ id, name, Component }) => (
        <Grid item key={id} sx={{ m: 2 }}>
          <Component title={name} start={start} />
        </Grid>
      ))}
    </Grid>
  );
});

export default SensorList;
