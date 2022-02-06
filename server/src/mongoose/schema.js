import { Schema } from 'mongoose';

const types = Schema.Types;
const timestamp = {
  type: types.Number,
  min: 0,
};

export default new Schema(
  {
    sensor: {
      type: types.String,
      unique: true,
      select: true,
    },
    ts: timestamp,
    icon: types.String,
    weather_code: types.Number,
    summary: types.String,
    temp_c: types.Number,
    humidity: types.Number,
    pressure: types.Number,
    dewpoint: types.Number,
    feels_like_c: types.Number,
    nearest_storm_distance: types.Number,
    precip_type: types.String,
    precip_intensity: types.Number,
    precip_probability: types.Number,
    wind_speed: types.Number,
    wind_gust: types.Number,
    wind_bearing: types.Number,
    cloud_cover: types.Number,
    uv_index: types.Number,
    visibility: types.Number,
    ozone: types.Number,
  },
);