import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { RelayEnvironmentProvider } from 'react-relay';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import useInterval from 'lib/hooks/useInterval';
import TimestampContext from 'modules/app/components/TimestampContext';
import AppBar from 'modules/app/components/AppBar';
import SensorList from 'modules/data/components/SensorList';
import SensorChart from 'modules/data/components/SensorChart';
import SensorTable from 'modules/data/components/SensorTable';
import environment from 'modules/relay/environment';
import theme from 'modules/app/styles/theme';

const App = () => {
  const [timestamp, setTimestamp] = React.useState(new Date());
  useInterval(() => setTimestamp(new Date()), 60000);

  return (
    <HashRouter>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <AppBar />
        <RelayEnvironmentProvider environment={environment}>
          <Grid container direction="row" spacing={2} justifyContent="space-between" sx={{ p: 2 }}>
            <Grid item xs={12} md={6} lg={3}>
              <TimestampContext.Provider value={timestamp}>
                <SensorList />
              </TimestampContext.Provider>
            </Grid>
            <Grid item xs={12} md={6} lg={9}>
              <TimestampContext.Provider value={timestamp}>
                <Switch>
                  <Route exact path="/sensor/:id/table" component={SensorTable} />
                  <Route exact path="/sensor/:id/chart" component={SensorChart} />
                </Switch>
              </TimestampContext.Provider>
            </Grid>
          </Grid>
        </RelayEnvironmentProvider>
      </ThemeProvider>
    </HashRouter>
  );
};

export default App;
