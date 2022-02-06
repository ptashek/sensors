import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import { Grid, Divider } from '@mui/material';
import { useTrend } from 'lib/hooks';
import SensorData from 'modules/data/components/SensorData';
import TrendArrow from 'modules/data/components/TrendArrow';
import WeatherIcon from 'modules/app/components/WeatherIcon';
import WeatherCondition from 'modules/app/components/WeatherCondition';
import Precipitation from 'modules/app/components/Precipitation';
import CloudCover from 'modules/app/components/CloudCover';
import Wind from 'modules/app/components/Wind';
import environment from 'modules/relay/environment';

const Sensor = ({ title, data }) => {
  const tempTrend = useTrend(data, 'temp_c');
  const humidityTrend = useTrend(data, 'humidity');
  const pressureTrend = useTrend(data, 'pressure');
  const dewpointTrend = useTrend(data, 'dewponit');

  const {
    ts,
    sensor,
    icon,
    weather_code,
    temp_c,
    feels_like_c,
    humidity,
    dewpoint,
    pressure,
    cloud_cover,
    precip_type,
    precip_intensity,
    wind_speed,
    wind_bearing,
  } = data[0];

  const wind_kph = Math.round(parseFloat(wind_speed) * 3.6);

  return (
    <SensorData sensor={sensor} title={title} ts={ts}>
      <Grid container justifyContent="space-between">
        <Grid item>
          <div>
            Temperature: {parseFloat(temp_c).toFixed(1)} / {parseFloat(feels_like_c).toFixed(1)}
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
          <div>
            <WeatherCondition code={weather_code} />
          </div>
        </Grid>
        <Grid item>
          <WeatherIcon icon={icon} />
        </Grid>
      </Grid>
      <Divider />
      <Grid container justifyContent="center">
        <CloudCover ratio={cloud_cover} />
        <Precipitation kind={precip_type} intensity={precip_intensity} />
        <Wind bearing={wind_bearing} speed={wind_kph} unit="km/h" />
      </Grid>
    </SensorData>
  );
};

const OpenWeatherMap = ({ title, start }) => {
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
        query OpenWeatherMapQuery($start: Int!) {
          data: search(sensor: OWM, start: $start, sortOrder: asc, limit: 3) {
            ts
            sensor
            icon
            weather_code
            temp_c
            humidity
            pressure
            dewpoint
            feels_like_c
            cloud_cover
            precip_type
            precip_intensity
            wind_speed
            wind_bearing
          }
        }
      `}
      variables={{ start }}
      render={renderQuery}
    />
  );
};

export default React.memo(OpenWeatherMap);
