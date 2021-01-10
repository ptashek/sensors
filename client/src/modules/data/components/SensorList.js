import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Grid from '@material-ui/core/Grid';
import { getPastTimestamp } from 'lib/utils';
import TimestampContext from 'modules/app/components/TimestampContext';
import ContentWrapper, { Loading } from 'modules/app/components/ContentWrapper';
import environment from 'modules/relay/environment';
import sensorConfig from 'modules/data/sensorConfig';

const Sensors = React.memo((props) =>
  sensorConfig
    .filter(({ id }) => Array.isArray(props[id]) && props[id].length > 0)
    .map(({ id, name, Component }) => (
      <Grid item xs={12} sm={6} lg={3} key={id}>
        <Component data={props[id]} title={name} />
      </Grid>
    )),
);

const SensorList = React.memo(() => {
  const content = React.useRef(<Loading />);
  const timestamp = React.useContext(TimestampContext);
  const [start, setStart] = React.useState(
    getPastTimestamp(10, 'minutes', { startFrom: timestamp }),
  );

  React.useEffect(() => {
    setStart(getPastTimestamp(10, 'minutes', { startFrom: timestamp }));
  }, [timestamp]);

  const renderQuery = ({ error, props: relayProps }) => {
    if (error) {
      content.current = <ContentWrapper>{error.message}</ContentWrapper>;
    } else if (relayProps) {
      content.current = (
        <Grid container direction="row" justify="space-evenly" alignItems="flex-start">
          <Sensors {...relayProps} />
        </Grid>
      );
    }

    return content.current;
  };

  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query SensorListQuery($start: Int!) {
          BME280: search(sensor: BME280, sortOrder: desc, start: $start, limit: 10) {
            ...BME280_data
          }
          DARKSKY: search(sensor: DARKSKY, sortOrder: desc, start: $start, limit: 10) {
            ...DarkSky_data
          }
        }
      `}
      variables={{ start }}
      render={renderQuery}
    />
  );
});

export default SensorList;
