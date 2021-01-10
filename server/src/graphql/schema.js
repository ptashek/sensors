import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLList,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLString
} from "graphql";
import { searchResolver } from "./resolvers";

const SensorName = new GraphQLEnumType({
  name: "SensorName",
  values: {
    BME280: { value: "BME280" },
    DARKSKY: { value: "DARKSKY" }
  }
});

const SortOrder = new GraphQLEnumType({
  name: "SortOrder",
  values: {
    asc: { value: "asc" },
    desc: { value: "desc" }
  }
});

const PrecipType = new GraphQLEnumType({
  name: "PrecipType",
  values: {
    none: { value: "none" },
    rain: { value: "rain" },
    snow: { value: "snow" },
    sleet: { value: "sleet" }
  }
});

const Icon = new GraphQLEnumType({
  name: "Icon",
  values: {
    clearDay: { value: "clear-day" },
    clearNight: { value: "clear-night" },
    rain: { value: "rain" },
    snow: { value: "snow" },
    sleet: { value: "sleet" },
    wind: { value: "wind" },
    fog: { value: "fog" },
    cloudy: { value: "cloudy" },
    partlyCloudyDay: { value: "partly-cloudy-day" },
    partlyCloudyNight: { value: "partly-cloudy-night" }
  }
});

const SensorDataType = new GraphQLObjectType({
  name: "SensorData",
  fields: {
    id: {
      type: GraphQLNonNull(GraphQLID),
      resolve: row => row._id
    },
    sensor: { type: GraphQLNonNull(SensorName) },
    ts: { type: GraphQLNonNull(GraphQLFloat) },
    icon: { type: Icon },
    summary: { type: GraphQLString },
    temp_c: { type: GraphQLFloat },
    temp_f: { type: GraphQLFloat },
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
    ozone: { type: GraphQLFloat }
  }
});

const queryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    search: {
      type: new GraphQLList(SensorDataType),
      args: {
        sensor: { type: SensorName },
        start: { type: GraphQLInt },
        end: { type: GraphQLInt },
        limit: { type: GraphQLInt },
        sortOrder: { type: SortOrder }
      },
      resolve: (_, args, { db }) => searchResolver(args, db)
    }
  }
});

export default new GraphQLSchema({
  query: queryType
});
