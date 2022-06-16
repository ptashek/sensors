import React, { Suspense } from 'react';
import { graphql, useQueryLoader, usePreloadedQuery } from 'react-relay';
import calculateTrend from 'lib/calculateTrend';
import SensorSkeleton from 'modules/app/components/SensorSkeleton';
import SensorData from 'modules/data/components/SensorData';
import TrendArrow from 'modules/app/components/TrendArrow';

const trendKeys = ['temp_c', 'humidity', 'pressure', 'dewpoint'];

const BME280Query = graphql`
  query BME280Query($fromDate: DateTime!) {
    data: search(sensor: BME280, fromDate: $fromDate, sortOrder: desc, limit: 3) {
      dt
      sensor
      temp_c
      humidity
      pressure
      dewpoint
    }
  }
`;

const Sensor = ({ title, queryRef }) => {
  const { data } = usePreloadedQuery(BME280Query, queryRef);

  const trend = React.useMemo(() => calculateTrend(data, trendKeys), [data]);

  const { dt, sensor, temp_c, humidity, pressure, dewpoint } = data[0];

  return (
    <SensorData sensor={sensor} title={title} dt={dt}>
      <div>
        Temperature: {parseFloat(temp_c).toFixed(1)}
        &deg;C
        <TrendArrow trend={trend.temp_c} />
      </div>
      <div>
        Dewpoint: {parseFloat(dewpoint).toFixed(1)}&deg;C
        <TrendArrow trend={trend.dewpoint} />
      </div>
      <div>
        Humidity: {parseFloat(humidity).toFixed(1)} %RH
        <TrendArrow trend={trend.humidity} />
      </div>
      <div>
        Pressure: {parseFloat(pressure).toFixed(0)} HPa
        <TrendArrow trend={trend.pressure} />
      </div>
    </SensorData>
  );
};

const BME280 = ({ title, fromDate }) => {
  const content = React.useRef(<SensorSkeleton />);
  const [sensorQueryRef, loadSensorQuery] = useQueryLoader(BME280Query);

  React.useEffect(() => {
    loadSensorQuery({ sensor: 'BME280', fromDate: fromDate.toISOString() });
  }, [fromDate, loadSensorQuery]);

  if (sensorQueryRef != null) {
    content.current = (
      <Suspense fallback={content.current}>
        <Sensor title={title} queryRef={sensorQueryRef} />
      </Suspense>
    );
  }

  return content.current;
};

export default React.memo(BME280);
