import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import Grid from '@mui/material/Grid';
import { useTrend } from 'lib/hooks';
import SensorData from 'modules/data/components/SensorData';
import TrendArrow from 'modules/data/components/TrendArrow';
import environment from 'modules/relay/environment';

const Sensor = ({ title, data }) => {
  const tempTrend = useTrend(data, 'temp_c');
  const humidityTrend = useTrend(data, 'humidity');
  const pressureTrend = useTrend(data, 'pressure');
  const dewpointTrend = useTrend(data, 'dewpoint');


  const { ts, sensor, temp_c, humidity, pressure, dewpoint } = data[0];

  return (
    <SensorData sensor={sensor} title={title} ts={ts}>
      <div>
        Temperature: {parseFloat(temp_c).toFixed(1)}
        &deg;C
        <TrendArrow trend={tempTrend} />
      </div>
      <div>
        Dewpoint: {parseFloat(dewpoint).toFixed(1)}&deg;C
        <TrendArrow trend={dewpointTrend} />
      </div>
      <div>
        Humidity: {parseFloat(humidity).toFixed(1)} %RH
        <TrendArrow trend={humidityTrend} />
      </div>
      <div>
        Pressure: {parseFloat(pressure).toFixed(0)} HPa
        <TrendArrow trend={pressureTrend} />
      </div>
    </SensorData>
  );
};

const BME280 = ({ title, start }) => {
  const renderQuery = React.useCallback(
    ({ error, props: relayProps }) => {
      if (error) {
        return error.message;
      }

      const data = relayProps?.data;

      if (!Array.isArray(data)) {
        return null;
      }

      return <Sensor title={title} data={data} />;
    },
    [title],
  );

  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query BME280Query($start: Int!) {
          data: search(sensor: BME280, start: $start, sortOrder: asc, limit: 3) {
            ts
            sensor
            temp_c
            humidity
            pressure
            dewpoint
          }
        }
      `}
      variables={{ start }}
      render={renderQuery}
    />
  );
};

export default React.memo(BME280);
