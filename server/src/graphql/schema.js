import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLList,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { searchResolver, aggregateResolver } from './resolvers';

const SensorName = new GraphQLEnumType({
  name: 'SensorName',
  values: {
    BME280: { value: 'BME280' },
    OWM: { value: 'OWM' },
  },
});

const SortOrder = new GraphQLEnumType({
  name: 'SortOrder',
  values: {
    asc: { value: 1 },
    desc: { value: -1 },
  },
});

const PrecipType = new GraphQLEnumType({
  name: 'PrecipType',
  values: {
    none: { value: 'none' },
    rain: { value: 'rain' },
    snow: { value: 'snow' },
  },
});

const Icon = new GraphQLEnumType({
  name: 'Icon',
  values: {
    /*
      Reference:
      https://openweathermap.org/weather-conditions
    */
    owm01d: { value: '01d' },
    owm01n: { value: '01n' },
    owm02d: { value: '02d' },
    owm02n: { value: '02n' },
    owm03d: { value: '03d' },
    owm03n: { value: '03n' },
    owm04d: { value: '04d' },
    owm04n: { value: '04n' },
    owm09d: { value: '09d' },
    owm09n: { value: '09n' },
    owm10d: { value: '10d' },
    owm10n: { value: '10n' },
    owm11d: { value: '11d' },
    owm11n: { value: '11n' },
    owm13d: { value: '13d' },
    owm13n: { value: '13n' },
    owm50d: { value: '50d' },
    owm50n: { value: '50n' },
  },
});

const SensorDataType = new GraphQLObjectType({
  name: 'SensorData',
  fields: {
    id: {
      type: GraphQLNonNull(GraphQLID),
      resolve: (row) => row._id,
    },
    sensor: { type: GraphQLNonNull(SensorName) },
    ts: { type: GraphQLNonNull(GraphQLFloat) },
    dt: { type: GraphQLNonNull(GraphQLDateTime) },
    icon: { type: Icon },
    weather_code: { type: GraphQLInt },
    summary: { type: GraphQLString },
    temp_c: { type: GraphQLFloat },
    humidity: { type: GraphQLFloat },
    pressure: { type: GraphQLFloat },
    dewpoint: { type: GraphQLFloat },
    feels_like_c: { type: GraphQLFloat },
    nearest_storm_distance: { type: GraphQLFloat },
    precip_intensity: { type: GraphQLFloat },
    precip_type: { type: PrecipType },
    precip_probability: { type: GraphQLFloat },
    wind_speed: { type: GraphQLFloat },
    wind_gust: { type: GraphQLFloat },
    wind_bearing: { type: GraphQLInt },
    cloud_cover: { type: GraphQLFloat },
    uv_index: { type: GraphQLInt },
    visibility: { type: GraphQLFloat },
    ozone: { type: GraphQLFloat },
  },
});

const AggregateDataType = new GraphQLObjectType({
  name: 'AggregateData',
  fields: {
    id: {
      type: GraphQLNonNull(GraphQLID),
      resolve: (row) => row._id,
    },
    sensor: { type: GraphQLNonNull(SensorName) },
    dt: { type: GraphQLNonNull(GraphQLDateTime) },
    temp_c: { type: GraphQLFloat },
    feels_like_c: { type: GraphQLFloat },
    dewpoint: { type: GraphQLFloat },
    humidity: { type: GraphQLFloat },
    pressure: { type: GraphQLFloat },
    precip_probability: { type: GraphQLFloat },
    precip_intensity: { type: GraphQLFloat },
    wind_speed: { type: GraphQLFloat },
    wind_gust: { type: GraphQLFloat },
    wind_bearing: { type: GraphQLInt },
    cloud_cover: { type: GraphQLFloat },
    uv_index: { type: GraphQLInt },
    visibility: { type: GraphQLFloat },
    ozone: { type: GraphQLFloat },
  },
});

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    search: {
      type: new GraphQLList(SensorDataType),
      args: {
        sensor: { type: GraphQLNonNull(SensorName) },
        fromDate: { type: GraphQLDateTime },
        toDate: { type: GraphQLDateTime },
        limit: { type: GraphQLInt },
        sortOrder: { type: SortOrder },
      },
      resolve: (_, args, { db }) => searchResolver(args, db),
    },
    aggregate: {
      type: new GraphQLList(AggregateDataType),
      args: {
        sensor: { type: GraphQLNonNull(SensorName) },
        fromDate: { type: GraphQLDateTime },
        toDate: { type: GraphQLDateTime },
        bucketCount: { type: GraphQLInt },
        sortOrder: { type: SortOrder },
      },
      resolve: (_, args, { db }) => aggregateResolver(args, db),
    },
  },
});

export default new GraphQLSchema({
  query: queryType,
});
