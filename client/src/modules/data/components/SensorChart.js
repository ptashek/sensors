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
} from 'react-jsx-highstock';
import { styled, useTheme } from '@mui/material/styles';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Grid, Button, ButtonGroup, FormControlLabel, Switch, TextField } from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import { getPastDate } from 'lib/dateUtils';
import ReferenceDateContext from 'modules/app/components/ReferenceDateContext';
import { useInterval } from '../../../lib/hooks';

const noop = () => null;

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
          data={data.map(({ dt, temp_c }) => [new Date(dt), temp_c])}
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
          data={data.map(({ dt, feels_like_c }) => [new Date(dt), feels_like_c])}
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
          data={data.map(({ dt, humidity }) => [new Date(dt), humidity])}
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

  const [dateRangeUserDefined, setDateRangeUserDefined] = React.useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = React.useState(false);

  const toggleAutoRefresh = React.useCallback((e) => {
    setAutoRefreshEnabled(e.target.checked);
  }, []);

  const resetDateRange = React.useCallback(() => {
    setFromDate(getPastDate(1, 'days', currentDate));
    setToDate(currentDate);
    setDateRangeUserDefined(false);
  }, [currentDate]);

  const setStartDate = React.useCallback((value) => {
    setFromDate(value);
    setDateRangeUserDefined(true);
  }, []);

  const setEndDate = React.useCallback((value) => {
    setToDate(value);
    setDateRangeUserDefined(true);
  }, []);

  const submitQuery = React.useCallback(
    () =>
      loadChartDataQuery(
        {
          sensor: sensorName,
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
        },
        { fetchPolicy: 'network-only' },
      ),
    [sensorName, fromDate, toDate, loadChartDataQuery],
  );

  React.useEffect(() => {
    submitQuery();
  }, [sensorName]);

  useInterval(submitQuery, autoRefreshEnabled && !dateRangeUserDefined ? 60000 : null);

  return (
    <>
      <Grid container alignItems="center" alignContent="center" sx={{ m: 2 }}>
        <Grid item container spacing={2} xs={8} alignItems="center" alignContent="center">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid item>
              <DateTimePicker
                reduceAnimations={true}
                disableFuture={true}
                ampm={false}
                value={fromDate}
                onChange={noop}
                onAccept={setStartDate}
                inputFormat="dd/MM/yyyy HH:mm"
                renderInput={(props) => <StyledTextField {...props} label="Start date" />}
              />
            </Grid>
            <Grid item>
              <DateTimePicker
                reduceAnimations={true}
                disableFuture={true}
                ampm={false}
                value={toDate}
                onChange={noop}
                onAccept={setEndDate}
                inputFormat="dd/MM/yyyy HH:mm"
                renderInput={(props) => <StyledTextField {...props} label="End date" />}
              />
            </Grid>
          </LocalizationProvider>
        </Grid>
        <FormControlLabel
          control={
            <Switch
              disabled={dateRangeUserDefined}
              checked={autoRefreshEnabled}
              onChange={toggleAutoRefresh}
            />
          }
          label="Auto"
        />
        <ButtonGroup disableElevation>
          <Button
            variant="contained"
            size="small"
            startIcon={<FindInPageIcon />}
            aria-label="submit query"
            onClick={submitQuery}
          >
            Search
          </Button>
          <Button
            variant="contained"
            size="small"
            color="secondary"
            startIcon={<RotateLeftIcon />}
            aria-label="reset date range"
            disabled={!dateRangeUserDefined}
            onClick={resetDateRange}
          >
            Reset
          </Button>
        </ButtonGroup>
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
          <Suspense fallback={<Loading isLoading />}>
            {chartDataQueryRef !== null ? <ChartData queryRef={chartDataQueryRef} /> : null}
          </Suspense>
        </HighchartsChart>
      </HighchartsProvider>
    </>
  );
};

export default React.memo(SensorChart);
