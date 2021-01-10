import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { useParams } from 'react-router-dom';
import * as Highcharts from 'highcharts';
import Stock from 'highcharts/modules/stock';
import HighchartsReact from 'highcharts-react-official';
import { getUnixTime } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import { Grid, IconButton, Paper, Tooltip, Typography } from '@material-ui/core';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import { Skeleton } from '@material-ui/lab';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { getPastTimestamp } from 'lib/utils';
// import Loading from 'modules/app/components/Loading';
import TimestampContext from 'modules/app/components/TimestampContext';
import ContentWrapper, { Loading } from 'modules/app/components/ContentWrapper';
import environment from 'modules/relay/environment';
import sensorConfig from 'modules/data/sensorConfig';

Stock(Highcharts);

const dayInMillis = 24 * 60 * 60 * 1000;
const useStyles = makeStyles((theme) => ({
  wrapper: {
    marginTop: theme.spacing(-0.5),
  },
  chart: {
    height: '48vh',
  },
}));

const p90 = (values) => {
  /*
    Highcharts provides numeric-only values, 
    unless the hasNulls property is set to true
  */
  let numValues;
  if (values.hasNulls) {
    numValues = values.filter((value) => value !== null);
  } else {
    numValues = values;
  }

  if (numValues.length === 0) {
    return null;
  }

  const pIndex = Math.ceil(0.9 * numValues.length) - 1;
  return numValues.sort()[pIndex];
};

const SensorChart = React.memo(() => {
  const timestamp = React.useContext(TimestampContext);
  const timezoneOffset = React.useRef(timestamp.getTimezoneOffset());
  const params = useParams();
  const classes = useStyles();
  const theme = useTheme();
  const content = React.useRef(<Skeleton animation="wave" className={classes.chart} />);
  const [start, setStart] = React.useState(
    getPastTimestamp(1, 'days', { startFrom: timestamp, asDate: true }),
  );
  const [end, setEnd] = React.useState(new Date());
  const [zoomLevel, setZoomLevel] = React.useState(3);
  const [dateRangeUserDefined, setDateRangeUserDefined] = React.useState(false);

  React.useEffect(() => {
    const nextTimezoneOffset = timestamp.getTimezoneOffset();
    if (nextTimezoneOffset !== timezoneOffset.current) {
      timezoneOffset.current = nextTimezoneOffset;
    }

    if (!dateRangeUserDefined) {
      setStart(getPastTimestamp(1, 'days', { startFrom: timestamp, asDate: true }));
      setEnd(new Date());
    }
  }, [timestamp, dateRangeUserDefined]);

  React.useEffect(() => {
    Highcharts.setOptions({
      time: {
        timezoneOffset: timezoneOffset.current,
      },
    });
  }, [timezoneOffset]);

  const sensorName = React.useMemo(() => sensorConfig.find(({ id }) => id === params.id)?.name, [
    sensorConfig,
    params.id,
  ]);

  const resetDateRange = React.useCallback(() => setDateRangeUserDefined(false), []);

  const setStartDate = React.useCallback(
    (value) => {
      setStart(value);
      setDateRangeUserDefined(true);
    },
    [],
  );

  const setEndDate = React.useCallback(
    (value) => {
      setEnd(value);
      setDateRangeUserDefined(true);
    },
    [],
  );

  const getSeries = React.useCallback(
    (data) => [
      {
        type: 'column',
        name: 'Temperature',
        xAxis: 0,
        yAxis: 0,
        color: theme.palette.colors.plum500,
        data: data.map(({ ts, temp_c }) => [ts * 1000, temp_c]),
        tooltip: {
          valueDecimals: 1,
          valueSuffix: '°C',
        },
      },
      {
        type: 'column',
        name: 'Apparent',
        xAxis: 0,
        yAxis: 0,
        color: theme.palette.colors.plum200,
        data: data.map(({ ts, feels_like_c }) => [ts * 1000, feels_like_c]),
        tooltip: {
          valueDecimals: 1,
          valueSuffix: '°C',
        },
      },
      {
        type: 'line',
        name: 'Humidity',
        xAxis: 0,
        yAxis: 1,
        color: theme.palette.colors.kiwi400,
        data: data.map(({ ts, humidity }) => [ts * 1000, humidity]),
        tooltip: {
          valueDecimals: 1,
          valueSuffix: '%RH',
        },
      },
    ],
    [theme.palette.colors],
  );

  const chartOptions = React.useMemo(() => ({
      chart: {
        zoomType: 'x',
        animation: false,
      },
      plotOptions: {
        series: {
          animation: false,
          dataGrouping: {
            approximation: p90,
          },
        },
      },
      navigator: {
        margin: theme.spacing(1),
      },
      rangeSelector: {
        verticalAlign: 'bottom',
        inputEnabled: false,
        buttons: [
          {
            type: 'minute',
            count: 30,
            text: '30m',
            events: {
              click: () => setZoomLevel(0),
            },
          },
          {
            type: 'hour',
            count: 1,
            text: '1h',
            events: {
              click: () => setZoomLevel(1),
            },
          },
          {
            type: 'hour',
            count: 3,
            text: '3h',
            events: {
              click: () => setZoomLevel(2),
            },
          },
          {
            type: 'hour',
            count: 12,
            text: '12h',
            events: {
              click: () => setZoomLevel(3),
            },
          },
          {
            type: 'day',
            count: 1,
            text: '1d',
            events: {
              click: () => setZoomLevel(4),
            },
          },
          {
            type: 'all',
            text: 'All',
            events: {
              click: () => setZoomLevel(5),
            },
          },
        ],
        selected: zoomLevel,
      },
      xAxis: {
        type: 'datetime',
      },
      yAxis: [
        {
          title: {
            text: 'Temperature °C',
          },
          opposite: false,
          tickInterval: 5,
          minTickInterval: 1,
        },
        {
          title: {
            text: 'Humidity %RH',
          },
          opposite: true,
          tickInterval: 5,
          minTickInterval: 1,
        },
      ],
    }), [theme, zoomLevel]);

  const renderQuery = ({ error, props: relayProps }) => {
    if (error) {
      return error.message;
    }

    if (relayProps?.data) {
      content.current = (
        <HighchartsReact
          highcharts={Highcharts}
          constructorType="stockChart"
          containerProps={{ className: classes.chart }}
          options={{ ...chartOptions, series: getSeries(relayProps.data) }}
        />
      );

      return content.current;
    }

    return <Loading>{content.current}</Loading>;
  };

  return (
    <ContentWrapper className={classes.wrapper}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Grid container alignItems="center" alignContent="center">
          <Grid item container spacing={2} xs={8} alignItems="center" alignContent="center">
            <Grid item>
              <DateTimePicker
                autoOk
                disableFuture
                ampm={false}
                value={start}
                onChange={setStartDate}
                label="Start date"
                format="dd/MM/yyyy HH:mm"
              />
            </Grid>
            <Grid item>
              <DateTimePicker
                autoOk
                disableFuture
                ampm={false}
                value={end}
                onChange={setEndDate}
                label="End date"
                format="dd/MM/yyyy HH:mm"
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
          </Grid>
          <Grid item xs={4}>
            <Typography align="center" variant="h6" paragraph>
              {sensorName}
            </Typography>
          </Grid>
        </Grid>
      </MuiPickersUtilsProvider>
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
    </ContentWrapper>
  );
});

export default SensorChart;
