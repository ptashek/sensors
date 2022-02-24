import React, { Suspense } from 'react';
import { graphql, useQueryLoader, usePreloadedQuery } from 'react-relay';
import { Grid, Divider } from '@mui/material';
import calculateTrend from 'lib/calculateTrend';
import SensorSkeleton from 'modules/app/components/SensorSkeleton';
import SensorData from 'modules/data/components/SensorData';
import TrendArrow from 'modules/app/components/TrendArrow';
import WeatherIcon from 'modules/app/components/WeatherIcon';
import WeatherCondition from 'modules/app/components/WeatherCondition';
import Precipitation from 'modules/app/components/Precipitation';
import CloudCover from 'modules/app/components/CloudCover';
import Wind from 'modules/app/components/Wind';

const trendKeys = ['temp_c', 'humidity', 'pressure', 'dewponit'];

const OpenWeatherMapQuery = graphql`
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
`;

const Sensor = ({ title, queryRef }) => {
  const { data } = usePreloadedQuery(OpenWeatherMapQuery, queryRef);

  const trend = React.useMemo(() => calculateTrend(data, trendKeys), [data]);

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
  } = data[data.length - 1];

  const wind_kph = Math.round(parseFloat(wind_speed) * 3.6);

  return (
    <SensorData sensor={sensor} title={title} ts={ts}>
      <Grid container justifyContent="space-between">
        <Grid item>
          <div>
            Temperature: {parseFloat(temp_c).toFixed(1)} / {parseFloat(feels_like_c).toFixed(1)}
            &deg;C
            <TrendArrow trend={trend.temp_c} />
          </div>
          <div>
            Dewpoint: {parseFloat(dewpoint).toFixed(1)}&deg;C
            <TrendArrow trend={trend.dewpoint} />
          </div>
          <div>
            Humidity: {parseFloat(humidity).toFixed(1)} %RH
            <TrendArrow trend={trend.humidity} />
          </div>
          <div>
            Pressure: {parseFloat(pressure).toFixed(0)} HPa
            <TrendArrow trend={trend.pressure} />
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
  const content = React.useRef(<SensorSkeleton />);
  const [sensorQueryRef, loadSensorQuery] = useQueryLoader(OpenWeatherMapQuery);

  React.useEffect(() => {
    loadSensorQuery({ sensor: 'OWM', start });
  }, [start, loadSensorQuery]);

  if (sensorQueryRef != null) {
    content.current = (
      <Suspense fallback={content.current}>
        <Sensor title={title} queryRef={sensorQueryRef} />
      </Suspense>
    );
  }

  return content.current;
};

export default React.memo(OpenWeatherMap);
