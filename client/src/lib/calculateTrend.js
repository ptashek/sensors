const calculateTrend = (data, keys = []) => {
  if (!data || !Array.isArray(data) || !Array.isArray(keys)) {
    return {};
  }

  return keys.reduce((acc, key) => {
    const intercept = data[0][key];
    const trend = (data[data.length - 1][key] - intercept) / data.length;

    if (trend > 0) {
      acc[key] = 1;
    } else if (trend < 0) {
      acc[key] = -1;
    } else {
      acc[key] = 0;
    }

    return acc;
  }, {});
};

export default calculateTrend;
