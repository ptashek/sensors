import React from 'react';

const weatherConditions = {
  200: 'Thunderstorm With Light Rain',
  201: 'Thunderstorm With Rain',
  202: 'Thunderstorm With Heavy Rain',
  210: 'Light Thunderstorm',
  211: 'Thunderstorm',
  212: 'Heavy Thunderstorm',
  221: 'Ragged Thunderstorm',
  230: 'Thunderstorm With Light Drizzle',
  231: 'Thunderstorm With Drizzle',
  232: 'Thunderstorm With Heavy Drizzle',
  300: 'Light Intensity Drizzle',
  301: 'Drizzle',
  302: 'Heavy Intensity Drizzle',
  310: 'Light Intensity Drizzle Rain',
  311: 'Drizzle Rain',
  312: 'Heavy Intensity Drizzle Rain',
  313: 'Shower Rain and Drizzle',
  314: 'Heavy Shower Rain and Drizzle',
  321: 'Shower Drizzle',
  500: 'Light Rain',
  501: 'Moderate Rain',
  502: 'Heavy Intensity Rain',
  503: 'Very Heavy Rain',
  504: 'Extreme Rain',
  511: 'Freezing Rain',
  520: 'Light Intensity Shower Rain',
  521: 'Shower Rain',
  522: 'Heavy Intensity Shower Rain',
  531: 'Ragged Shower Rain',
  600: 'Light Snow',
  601: 'Snow',
  602: 'Heavy Snow',
  611: 'Sleet',
  612: 'Light Shower Sleet',
  613: 'Shower Sleet',
  615: 'Light Rain and Snow',
  616: 'Rain and Snow',
  620: 'Light Shower Snow',
  621: 'Shower Snow',
  622: 'Heavy Shower Snow',
  701: 'Mist',
  711: 'Smoke',
  721: 'Haze',
  731: 'Sand/Dust Whirls',
  741: 'Fog',
  751: 'Sand',
  761: 'Dust',
  762: 'Volcanic Ash',
  771: 'Squalls',
  781: 'Tornado',
  800: 'Clear Sky',
  801: 'Few Clouds: 11-25%',
  802: 'Scattered Clouds: 25-50%',
  803: 'Broken Clouds: 51-84%',
  804: 'Overcast Clouds: 85-100%',
};

const knownCodes = Object.keys(weatherConditions).map(Number);

const WeatherCondition = ({ code }) => {
  if (knownCodes.includes(code)) {
    return weatherConditions[code];
  }

  return null;
};

export default React.memo(WeatherCondition);
