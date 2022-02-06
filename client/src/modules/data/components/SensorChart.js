import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { QueryRenderer, graphql } from 'react-relay';
import { useParams } from 'react-router-dom';
import Highcharts from 'highcharts/highstock';
import {
  HighchartsProvider,
  HighchartsStockChart as HighchartsChart,
  Chart,
  Title,
  Legend,
  XAxis,
  YAxis,
  AreaSeries,
  LineSeries,
  Loading,
  Navigator,
  RangeSelector,
  Tooltip as ChartTooltip,
} from 'react-jsx-highstock';
import { getUnixTime } from 'date-fns';
import DateTimePicker from '@mui/lab/DateTimePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { Grid, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import { getPastTimestamp } from 'lib/utils';
import TimestampContext from 'modules/app/components/TimestampContext';
import environment from 'modules/relay/environment';
import sensorConfig from 'modules/data/sensorConfig';

const noop = () => null;

const plotOptions = {
  series: {
    animation: false,
    connectNulls: false,
    tooltip: {
      xDateFormat: '%Y-%m-%d %H:%M',
    },
  },
};

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    padding: theme.spacing(1),
  },
}));

const SensorChart = () => {
  const params = useParams();
  const theme = useTheme();
  const timestamp = React.useContext(TimestampContext);

  const [end, setEnd] = React.useState(timestamp);
  const [start, setStart] = React.useState(
    getPastTimestamp(1, 'days', { startFrom: end, asDate: true }),
  );

  const [dateRangeUserDefined, setDateRangeUserDefined] = React.useState(false);

  React.useEffect(() => {
    if (!dateRangeUserDefined) {
      setStart(getPastTimestamp(1, 'days', { startFrom: timestamp, asDate: true }));
      setEnd(timestamp);
    }
  }, [timestamp, dateRangeUserDefined]);

  const sensorName = React.useMemo(
    () => sensorConfig.find(({ id }) => id === params.id)?.name,
    [params.id],
  );

  const resetDateRange = React.useCallback(() => setDateRangeUserDefined(false), []);

  const setStartDate = React.useCallback((value) => {
    setStart(value);
    setDateRangeUserDefined(true);
  }, []);

  const setEndDate = React.useCallback((value) => {
    setEnd(value);
    setDateRangeUserDefined(true);
  }, []);

  const renderQuery = React.useCallback(
    ({ error, props: relayProps }) => {
      if (error) {
        return <Title>{error.message}</Title>;
      }

      const data = relayProps?.data;

      if (!Array.isArray(data)) {
        return <Loading isLoading />;
      }

      return (
        <>
          <YAxis tickInterval={5} minTickInterval={1} id="left" opposite={false}>
            <YAxis.Title>Temperature &deg;C</YAxis.Title>
            <AreaSeries
              yAxis="left"
              name="Temperature"
              data={data.map(({ ts, temp_c }) => [ts * 1000, temp_c])}
              color={theme.palette.colors.plum500}
              tooltip={{
                valueDecimals: 1,
                valueSuffix: '°C',
              }}
              animation={false}
              connectNulls={false}
            />
            <AreaSeries
              yAxis="left"
              name="Apparent"
              data={data.map(({ ts, feels_like_c }) => [ts * 1000, feels_like_c])}
              color={theme.palette.colors.plum200}
              tooltip={{
                valueDecimals: 1,
                valueSuffix: '°C',
              }}
              animation={false}
              connectNulls={false}
            />
          </YAxis>
          <YAxis tickInterval={5} minTickInterval={1} id="right" opposite={true}>
            <YAxis.Title>Humidity %RH</YAxis.Title>
            <LineSeries
              yAxis="right"
              name="Humidity"
              data={data.map(({ ts, humidity }) => [ts * 1000, humidity])}
              color={theme.palette.colors.kiwi400}
              tooltip={{
                valueDecimals: 1,
                valueSuffix: '%',
              }}
              animation={false}
              connectNulls={false}
            />
          </YAxis>
        </>
      );
    },
    [theme.palette.colors],
  );

  return (
    <>
      <Grid container alignItems="center" alignContent="center" sx={{ m: 2 }}>
        <Grid item container spacing={2} xs={8} alignItems="center" alignContent="center">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid item>
              <DateTimePicker
                maxDateTime={new Date()}
                ampm={false}
                value={start}
                onChange={noop}
                onAccept={setStartDate}
                inputFormat="dd/MM/yyyy HH:mm"
                renderInput={(props) => <StyledTextField label="Start date" {...props} />}
              />
            </Grid>
            <Grid item>
              <DateTimePicker
                maxDateTime={new Date()}
                ampm={false}
                value={end}
                onChange={noop}
                onAccept={setEndDate}
                inputFormat="dd/MM/yyyy HH:mm"
                renderInput={(props) => <StyledTextField label="End date" {...props} />}
              />
            </Grid>
            <Grid item>
              <Tooltip title="Reset date range" arrow>
                <IconButton
                  size="small"
                  color="primary"
                  aria-label="reset date range"
                  component="span"
                  disabled={!dateRangeUserDefined}
                  onClick={resetDateRange}
                >
                  <RotateLeftIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </LocalizationProvider>
        </Grid>
        <Grid item xs={4}>
          <Typography align="center" variant="h6" paragraph>
            {sensorName}
          </Typography>
        </Grid>
      </Grid>
      <HighchartsProvider Highcharts={Highcharts}>
        <HighchartsChart
          time={{ timezoneOffset: timestamp.getTimezoneOffset() }}
          containerProps={{ style: { height: '85vh' } }}
        >
          <Chart zoomType="x" plotOptions={plotOptions} />
          <ChartTooltip />
          <Legend />
          <XAxis type="datetime" />
          <Navigator />
          <RangeSelector buttonPosition={{ align: 'right' }}>
            <RangeSelector.Button count={1} type="day" offsetMin={0} offsetMax={0}>
              1d
            </RangeSelector.Button>
            <RangeSelector.Button count={7} type="day" offsetMin={0} offsetMax={0}>
              7d
            </RangeSelector.Button>
            <RangeSelector.Button count={1} type="month" offsetMin={0} offsetMax={0}>
              1m
            </RangeSelector.Button>
            <RangeSelector.Button type="all" offsetMin={0} offsetMax={0}>
              All
            </RangeSelector.Button>
          </RangeSelector>
          <QueryRenderer
            environment={environment}
            query={graphql`
              query SensorChartQuery($sensor: SensorName!, $start: Int!, $end: Int!) {
                data: search(sensor: $sensor, start: $start, end: $end, sortOrder: asc) {
                  ts
                  temp_c
                  feels_like_c
                  humidity
                }
              }
            `}
            variables={{
              sensor: params.id,
              start: getUnixTime(start),
              end: getUnixTime(end),
            }}
            render={renderQuery}
          />
        </HighchartsChart>
      </HighchartsProvider>
    </>
  );
};

export default React.memo(SensorChart);
