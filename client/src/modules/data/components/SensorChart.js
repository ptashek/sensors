import React, { Suspense } from 'react';
import { graphql, useQueryLoader, usePreloadedQuery } from 'react-relay';
import { useParams } from 'react-router-dom';
import Highcharts from 'highcharts/highstock';
import {
  HighchartsProvider,
  HighchartsStockChart as HighchartsChart,
  Chart,
  Legend,
  XAxis,
  YAxis,
  AreaSeries,
  LineSeries,
  Loading,
  Navigator,
  Tooltip as ChartTooltip,
  RangeSelector,
} from 'react-jsx-highstock';
import { styled, useTheme } from '@mui/material/styles';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Grid, Button, ButtonGroup, FormControlLabel, Switch, TextField } from '@mui/material';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import { getPastDate } from 'lib/dateUtils';
import ReferenceDateContext from 'modules/app/components/ReferenceDateContext';
import { useInterval } from '../../../lib/hooks';

const plotOptions = {
  series: {
    animation: false,
    connectNulls: false,
  },
};

const SensorChartQuery = graphql`
  query SensorChartQuery($sensor: SensorName!, $fromDate: DateTime!, $toDate: DateTime!) {
    data: aggregate(sensor: $sensor, fromDate: $fromDate, toDate: $toDate, sortOrder: asc) {
      dt
      temp_c
      feels_like_c
      humidity
    }
  }
`;

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    padding: theme.spacing(1),
  },
}));

const ChartData = ({ queryRef }) => {
  const theme = useTheme();
  const { data } = usePreloadedQuery(SensorChartQuery, queryRef);

  return (
    <>
      <YAxis tickInterval={5} minTickInterval={1} id="left" opposite={false}>
        <YAxis.Title>Temperature &deg;C</YAxis.Title>
        <AreaSeries
          yAxis="left"
          name="Temperature"
          data={data.map(({ dt, temp_c }) => [new Date(dt).getTime(), temp_c])}
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
          data={data.map(({ dt, feels_like_c }) => [new Date(dt).getTime(), feels_like_c])}
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
          data={data.map(({ dt, humidity }) => [new Date(dt).getTime(), humidity])}
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
};

const SensorChart = () => {
  const { id: sensorName } = useParams();
  const [chartDataQueryRef, loadChartDataQuery] = useQueryLoader(SensorChartQuery);

  const currentDate = React.useContext(ReferenceDateContext);
  const [toDate, setToDate] = React.useState(currentDate);
  const [fromDate, setFromDate] = React.useState(getPastDate(1, 'days', toDate));
  const [autoRefreshEnabled, setAutoRefreshEnabled] = React.useState(false);

  const submitQuery = () =>
    loadChartDataQuery(
      {
        sensor: sensorName,
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      },
      { fetchPolicy: 'network-only' },
    );

  const autoRefreshData = () => {
    if (autoRefreshEnabled) {
      setToDate(currentDate);
      setFromDate(getPastDate(1, 'days', currentDate));
      submitQuery();
    }
  };

  const toggleAutoRefresh = React.useCallback((e) => {
    setAutoRefreshEnabled(e.target.checked);
  }, []);

  const setStartDate = React.useCallback((value) => {
    setFromDate(value);
  }, []);

  const setEndDate = React.useCallback((value) => {
    setToDate(value);
  }, []);

  React.useEffect(() => {
    submitQuery();
  }, [sensorName]);

  useInterval(autoRefreshData, autoRefreshEnabled ? 60000 : null);

  return (
    <>
      <Grid container alignItems="center" alignContent="center" sx={{ m: 2 }}>
        <Grid item container spacing={2} xs={8} alignItems="center" alignContent="center">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid item>
              <DateTimePicker
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                }}
                slotProps={{ textField: { size: 'small' } }}
                disabled={autoRefreshEnabled}
                reduceAnimations={true}
                disableFuture={true}
                ampm={false}
                value={fromDate}
                onChange={setStartDate}
                inputFormat="dd/MM/yyyy HH:mm"
                renderInput={(props) => <StyledTextField {...props} label="Start date" />}
              />
            </Grid>
            <Grid item>
              <DateTimePicker
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                }}
                slotProps={{ textField: { size: 'small' } }}
                disabled={autoRefreshEnabled}
                reduceAnimations={true}
                disableFuture={true}
                ampm={false}
                value={toDate}
                onChange={setEndDate}
                inputFormat="dd/MM/yyyy HH:mm"
                renderInput={(props) => <StyledTextField {...props} label="End date" />}
              />
            </Grid>
          </LocalizationProvider>
          <Grid item>
            <ButtonGroup disableElevation={true}>
              <Button
                disabled={autoRefreshEnabled}
                aria-label="set start date to 1 month ago"
                onClick={() => setStartDate(getPastDate(1, 'months', toDate))}
              >
                30d
              </Button>
              <Button
                disabled={autoRefreshEnabled}
                aria-label="set start date to 1 week ago"
                onClick={() => setStartDate(getPastDate(1, 'weeks', toDate))}
              >
                7d
              </Button>
              <Button
                disabled={autoRefreshEnabled}
                aria-label="set start date to 1 day ago"
                onClick={() => setStartDate(getPastDate(1, 'days', toDate))}
              >
                1d
              </Button>
              <Button
                disabled={autoRefreshEnabled}
                variant="contained"
                endIcon={<FindInPageIcon />}
                aria-label="submit query"
                onClick={submitQuery}
              >
                Search
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
        <FormControlLabel
          control={<Switch checked={autoRefreshEnabled} onChange={toggleAutoRefresh} />}
          label="Auto refresh"
        />
      </Grid>
      <HighchartsProvider Highcharts={Highcharts}>
        <HighchartsChart
          time={{ timezoneOffset: currentDate.getTimezoneOffset() }}
          containerProps={{ style: { height: '85vh' } }}
        >
          <Chart zoomType="x" plotOptions={plotOptions} />
          <ChartTooltip />
          <Legend />
          <XAxis type="datetime" />
          <Navigator />
          <RangeSelector>
            <RangeSelector.Button type="all">All</RangeSelector.Button>
          </RangeSelector>
          <Suspense fallback={<Loading isLoading />}>
            {chartDataQueryRef !== null ? <ChartData queryRef={chartDataQueryRef} /> : null}
          </Suspense>
        </HighchartsChart>
      </HighchartsProvider>
    </>
  );
};

export default React.memo(SensorChart);
