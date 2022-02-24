const calculateTrend = (data, keys = []) => {
  if (!data) {
    return {};
  }

  return keys.reduce((acc, key) => {
    const intercept = data[data.length - 1][key];
    const trend = (data[0][key] - intercept) / data.length;

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
