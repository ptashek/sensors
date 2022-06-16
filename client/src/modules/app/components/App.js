import React, { Suspense } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { RelayEnvironmentProvider } from 'react-relay';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import { getReferenceDate } from 'lib/dateUtils';
import useInterval from 'lib/hooks/useInterval';
import ReferenceDateContext from 'modules/app/components/ReferenceDateContext';
import AppBar from 'modules/app/components/AppBar';
import SensorList from 'modules/data/components/SensorList';
import environment from 'modules/relay/environment';
import theme from 'modules/app/styles/theme';

const LazyLoadSensorChart = React.lazy(() => import('modules/data/components/SensorChart'));
const LazyLoadSensorTable = React.lazy(() => import('modules/data/components/SensorTable'));

const App = () => {
  const [date, setDate] = React.useState(getReferenceDate());
  useInterval(() => setDate(getReferenceDate()), 60000);

  return (
    <HashRouter>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <AppBar />
        <RelayEnvironmentProvider environment={environment}>
          <Grid container direction="row" spacing={2} justifyContent="space-between" sx={{ p: 2 }}>
            <Grid item xs={12} md={6} lg={3}>
              <ReferenceDateContext.Provider value={date}>
                <SensorList />
              </ReferenceDateContext.Provider>
            </Grid>
            <Grid item xs={12} md={6} lg={9}>
              <ReferenceDateContext.Provider value={date}>
                <Suspense fallback={null}>
                  <Switch>
                    <Route exact path="/sensor/:id/table" component={LazyLoadSensorTable} />
                    <Route exact path="/sensor/:id/chart" component={LazyLoadSensorChart} />
                  </Switch>
                </Suspense>
              </ReferenceDateContext.Provider>
            </Grid>
          </Grid>
        </RelayEnvironmentProvider>
      </ThemeProvider>
    </HashRouter>
  );
};

export default App;
