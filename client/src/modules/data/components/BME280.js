import React from 'react';
import { graphql, useFragment } from 'react-relay/hooks';
import Typography from '@material-ui/core/Typography';
import { useTrend } from 'lib/hooks';
import SensorData from 'modules/data/components/SensorData';
import TrendArrow from 'modules/data/components/TrendArrow';

const BME280 = React.memo((props) => {
  const data = useFragment(
    graphql`
      fragment BME280_data on SensorData @relay(plural: true) {
        ts
        sensor
        temp_c
        humidity
        pressure
      }
    `,
    props.data,
  );

  const tempTrend = useTrend(data, 'temp_c');
  const humidityTrend = useTrend(data, 'humidity');

  const { title } = props;
  const { ts, sensor, temp_c, humidity, pressure } = data[0];

  return (
    <SensorData sensor={sensor} title={title} ts={ts}>
      <Typography variant="body2">
        Temperature: {parseFloat(temp_c).toFixed(1)}&deg;C
        <TrendArrow trend={tempTrend} />
      </Typography>
      <Typography variant="body2">
        Humidity: {parseFloat(humidity).toFixed(1)} %RH
        <TrendArrow trend={humidityTrend} />
      </Typography>
      <Typography variant="body2">Pressure: {parseFloat(pressure).toFixed(0)} HPa</Typography>
    </SensorData>
  );
});

export default BME280;
