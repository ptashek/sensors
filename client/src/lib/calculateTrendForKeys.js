const calculateTrend = (data) => {
  // Check if input is valid
  if (!Array.isArray(data) || data.length === 0) {
    return 0;
  }

  // Filter out non-numeric values
  data = data.filter((value) => typeof value === 'number' && !isNaN(value));

  // Calculate linear regression 
  const itemCount = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

  data.forEach((value, index) => {
    sumX += index;
    sumY += value;
    sumXY += index * value;
    sumXX += index * index;
  });

  const slope = (itemCount * sumXY - sumX * sumY) / (itemCount * sumXX - sumX * sumX);

  // Return trend based on slope sign
  if (slope > 0) {
    return 1;
  } else if (slope < 0) {
    return -1;
  } else {
    return 0;
  }
}

const calculateTrendForKeys = (data, keys) => {
  if (!Array.isArray(data) || data.length === 0 || !Array.isArray(keys) || keys.length === 0) {
    return {};
  }

  const trendForKeys = {};

  (new Set(keys)).forEach((key) => {
    // input data is expected to be sorted by date in descending order
    const valuesForKey = data.reduce((values, record) => { values.unshift(record[key]); return values; }, []);
    trendForKeys[key] = calculateTrend(valuesForKey);
  });

  return trendForKeys;
};

export default calculateTrendForKeys;