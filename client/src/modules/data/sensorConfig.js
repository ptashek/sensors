// @flow
import type { ComponentType } from 'react';
import BME280 from 'modules/data/components/BME280';
import DarkSky from 'modules/data/components/DarkSky';

type SensorConfig = $ReadOnlyArray<{|
  +id: string,
  +name: string,
  +Component: ComponentType<any>,
|}>;

const config: SensorConfig = [
  {
    id: 'BME280',
    name: 'Garage: Internal',
    Component: BME280,
  },
  {
    id: 'DARKSKY',
    name: 'Garage: External',
    Component: DarkSky,
  },
];

export default config;
