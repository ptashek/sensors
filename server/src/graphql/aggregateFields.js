const aggregateFields = [
  'temp_c',
  'feels_like_c',
  'dewpoint',
  'humidity',
  'pressure',
  'precip_probability',
  'precip_intensity',
  'wind_speed',
  'wind_gust',
  'wind_bearing',
  'cloud_cover',
  'uv_index',
  'visibility',
  'ozone',
];


export const groupByFields = aggregateFields.reduce((acc, field) => {
  acc[field] = { $avg: `$${field}` };
  return acc;
}, {});


export const projectionFields = aggregateFields.reduce((acc, field) => {
  acc[field] = `$${field}`;
  return acc;
}, {});