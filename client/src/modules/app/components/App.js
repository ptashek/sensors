import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import { useInterval } from 'lib/hooks';
import TimestampContext from 'modules/app/components/TimestampContext';
import AppBar from 'modules/app/components/AppBar';
import SensorList from 'modules/data/components/SensorList';
import SensorChart from 'modules/data/components/SensorChart';
import SensorTable from 'modules/data/components/SensorTable';
import theme from 'modules/app/styles/theme';

const App = () => {
  const [timestamp, setTimestamp] = React.useState(new Date());
  useInterval(() => setTimestamp(new Date()), 60000);

  return (
    <HashRouter>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <AppBar />
        <TimestampContext.Provider value={timestamp}>
          <Grid container direction="row" spacing={2} justifyContent="space-between" sx={{ p: 2 }}>
            <Grid item xs={12} sm={6} lg={2.5}>
              <SensorList />
            </Grid>
            <Grid item sm={6} lg={9.5}>
              <Switch>
                <Route exact path="/sensor/:id/table" component={SensorTable} />
                <Route exact path="/sensor/:id/chart" component={SensorChart} />
              </Switch>
            </Grid>
          </Grid>
        </TimestampContext.Provider>
      </ThemeProvider>
    </HashRouter>
  );
};

export default App;
