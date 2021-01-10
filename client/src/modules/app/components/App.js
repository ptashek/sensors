// @flow
import type { ComponentType } from 'react';
import { Component } from 'react';
import React, { Suspense } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { useInterval } from 'lib/hooks';
import TimestampContext from 'modules/app/components/TimestampContext';
import AppBar from 'modules/app/components/AppBar';
import SensorList from 'modules/data/components/SensorList';
import theme from 'modules/app/styles/theme';

const SensorTable = React.lazy<ComponentType<void>>(() =>
  import('modules/data/components/SensorTable'),
);
const SensorChart = React.lazy<ComponentType<void>>(() =>
  import('modules/data/components/SensorChart'),
);

const App: ComponentType<void> = () => {
  const [timestamp, setTimestamp] = React.useState<Date>(new Date());

  useInterval(() => setTimestamp(new Date()), 60000);

  return (
    <HashRouter>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <AppBar />
        <TimestampContext.Provider value={timestamp}>
          <SensorList />
          <Suspense fallback={null}>
            <Switch>
              <Route exact path="/sensor/:id/table" component={SensorTable} />
              <Route exact path="/sensor/:id/chart" component={SensorChart} />
            </Switch>
          </Suspense>
        </TimestampContext.Provider>
      </ThemeProvider>
    </HashRouter>
  );
};

export default App;
