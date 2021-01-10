import React from 'react';
import { graphql, useFragment } from 'react-relay/hooks';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import { Navigation, CloudQueue } from '@material-ui/icons';
import { useTrend } from 'lib/hooks';
import SensorData from 'modules/data/components/SensorData';
import TrendArrow from 'modules/data/components/TrendArrow';
import WeatherIcon from 'modules/app/components/WeatherIcon';

const useStyles = makeStyles((theme) => ({
  icon: {
    width: 64,
    height: 64,
  },
  wind: {
    transition: 'transform 200ms',
  },
}));

const Precipitation = React.memo(({ kind, intensity }) => {
  if (kind == 'none') {
    return null;
  }

  return (
    <Grid container item direction="row" spacing={1} xs={4}>
      <Grid item>
        <strong>{kind[0].toUpperCase()}</strong>
      </Grid>
      <Grid item>{parseFloat(intensity).toFixed(1)} mm/h</Grid>
    </Grid>
  );
});

const Wind = React.memo(({ bearing, speed, unit = 'km/h' }) => {
  const classes = useStyles();

  return (
    <Grid container item direction="row" spacing={1} xs={4}>
      <Grid item>
        <Navigation
          classes={{ root: classes.wind }}
          fontSize="small"
          style={{
            transform: `rotate(${180 + bearing}deg)`,
          }}
        />
      </Grid>
      <Grid item>
        {speed}&nbsp;{unit}
      </Grid>
    </Grid>
  );
});

const CloudCover = React.memo(({ ratio }) => (
  <Grid container item direction="row" spacing={1} xs={4}>
    <Grid item>
      <CloudQueue fontSize="small" />
    </Grid>
    <Grid item>{ratio * 100}%</Grid>
  </Grid>
));

const DarkSky = React.memo((props) => {
  const classes = useStyles();

  const data = useFragment(
    graphql`
      fragment DarkSky_data on SensorData @relay(plural: true) {
        ts
        sensor
        icon
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
    `,
    props.data,
  );

  const tempTrend = useTrend(data, 'temp_c');
  const humidityTrend = useTrend(data, 'humidity');

  const { title } = props;
  const {
    ts,
    sensor,
    icon,
    temp_c,
    feels_like_c,
    humidity,
    dewpoint,
    pressure,
    cloud_cover,
    precip_intensity,
    precip_type,
    wind_speed,
    wind_bearing,
  } = data[0];

  const wind_kph = Math.round(parseFloat(wind_speed) * 3.6);

  return (
    <SensorData sensor={sensor} title={title} ts={ts}>
      <Typography variant="body2" component="div">
        <Grid container alignItems="center" alignContent="center" spacing={1}>
          <Grid container direction="column" item alignItems="flex-start" xs={8}>
            <Grid item>
              Temperature: {parseFloat(temp_c).toFixed(1)} / {parseFloat(feels_like_c).toFixed(1)}
              &deg;C
              <TrendArrow trend={tempTrend} />
            </Grid>
            <Grid item>
              Humidity: {parseFloat(humidity).toFixed(1)} %RH
              <TrendArrow trend={humidityTrend} />
            </Grid>
            <Grid item>Dewpoint: {parseFloat(dewpoint).toFixed(1)}&deg;C</Grid>
            <Grid item>Pressure: {parseFloat(pressure).toFixed(0)} HPa</Grid>
          </Grid>
          <Grid item>
            <WeatherIcon className={classes.icon} variant={icon} />
          </Grid>
        </Grid>
      </Typography>
      <hr />
      <Typography component="span" variant="caption" component="div">
        <Grid
          container
          direction="row"
          alignItems="center"
          alignContent="space-between"
          justify="space-evenly"
        >
          <CloudCover ratio={parseFloat(cloud_cover).toFixed(0)} />
          <Precipitation kind={precip_type} intensity={parseFloat(precip_intensity).toFixed(1)} />
          <Wind bearing={wind_bearing} speed={wind_kph} unit="km/h" />
        </Grid>
      </Typography>
    </SensorData>
  );
});

export default DarkSky;
