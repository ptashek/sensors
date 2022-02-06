import BME280 from 'modules/data/components/BME280';
import OpenWeatherMap from 'modules/data/components/OpenWeatherMap';

const config = [
  {
    id: 'BME280',
    name: 'Indoors',
    Component: BME280,
  },
  {
    id: 'OWM',
    name: 'Outdoors',
    Component: OpenWeatherMap,
  },
];

export default config;
