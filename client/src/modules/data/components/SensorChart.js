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
  RangeSelector,
  Tooltip as ChartTooltip,
} from 'react-jsx-highstock';
import { styled, useTheme } from '@mui/material/styles';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Grid, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import { getPastDate } from 'lib/dateUtils';
import ReferenceDateContext from 'modules/app/components/ReferenceDateContext';
import sensorConfig from 'modules/data/sensorConfig';

const noop = () => null;

const plotOptions = {
  series: {
    animation: false,
    connectNulls: false,
  },
};

const SensorChartQuery = graphql`
  query SensorChartQuery($sensor: SensorName!, $fromDate: DateTime!, $toDate: DateTime!) {
    data: search(sensor: $sensor, fromDate: $fromDate, toDate: $toDate, sortOrder: asc) {
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
  const params = useParams();
  const [chartDataQueryRef, loadChartDataQuery] = useQueryLoader(SensorChartQuery);

  const currentDate = React.useContext(ReferenceDateContext);
  const [toDate, setToDate] = React.useState(currentDate);
  const [fromDate, setFromDate] = React.useState(getPastDate(1, 'days', toDate));

  const [dateRangeUserDefined, setDateRangeUserDefined] = React.useState(false);
  const resetDateRange = React.useCallback(() => setDateRangeUserDefined(false), []);

  const setStartDate = React.useCallback((value) => {
    setFromDate(value);
    setDateRangeUserDefined(true);
  }, []);

  const setEndDate = React.useCallback((value) => {
    setToDate(value);
    setDateRangeUserDefined(true);
  }, []);

  const sensorName = React.useMemo(
    () => sensorConfig.find(({ id }) => id === params.id)?.name,
    [params.id],
  );

  React.useEffect(() => {
    if (!dateRangeUserDefined) {
      setFromDate(getPastDate(1, 'days', currentDate));
      setToDate(currentDate);
    }
  }, [currentDate, dateRangeUserDefined]);

  React.useEffect(() => {
    loadChartDataQuery({
      sensor: params.id,
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
    });
  }, [fromDate, toDate, params.id, loadChartDataQuery]);

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
                renderInput={(props) => <StyledTextField label="Start date" {...props} />}
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
          time={{ timezoneOffset: currentDate.getTimezoneOffset() }}
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
            <RangeSelector.Button count={12} type="hour" offsetMin={0} offsetMax={0}>
              12h
            </RangeSelector.Button>
            <RangeSelector.Button count={6} type="hour" offsetMin={0} offsetMax={0}>
              6h
            </RangeSelector.Button>
            <RangeSelector.Button type="all" offsetMin={0} offsetMax={0}>
              All
            </RangeSelector.Button>
          </RangeSelector>
          <Suspense fallback={<Loading isLoading />}>
            {chartDataQueryRef && <ChartData queryRef={chartDataQueryRef} />}
          </Suspense>
        </HighchartsChart>
      </HighchartsProvider>
    </>
  );
};

export default React.memo(SensorChart);
