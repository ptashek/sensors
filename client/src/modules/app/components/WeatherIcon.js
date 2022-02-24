import React from 'react';

const weatherIcons = {
  owm01d: 'https://openweathermap.org/img/wn/01d@2x.png',
  owm01n: 'https://openweathermap.org/img/wn/01n@2x.png',
  owm02d: 'https://openweathermap.org/img/wn/02d@2x.png',
  owm02n: 'https://openweathermap.org/img/wn/02n@2x.png',
  owm03d: 'https://openweathermap.org/img/wn/03d@2x.png',
  owm03n: 'https://openweathermap.org/img/wn/03n@2x.png',
  owm04d: 'https://openweathermap.org/img/wn/04d@2x.png',
  owm04n: 'https://openweathermap.org/img/wn/04n@2x.png',
  owm09d: 'https://openweathermap.org/img/wn/09d@2x.png',
  owm09n: 'https://openweathermap.org/img/wn/09n@2x.png',
  owm10d: 'https://openweathermap.org/img/wn/10d@2x.png',
  owm10n: 'https://openweathermap.org/img/wn/10n@2x.png',
  owm11d: 'https://openweathermap.org/img/wn/11d@2x.png',
  owm11n: 'https://openweathermap.org/img/wn/11n@2x.png',
  owm13d: 'https://openweathermap.org/img/wn/13d@2x.png',
  owm13n: 'https://openweathermap.org/img/wn/13n@2x.png',
  owm50d: 'https://openweathermap.org/img/wn/50d@2x.png',
  owm50n: 'https://openweathermap.org/img/wn/50n@2x.png',
};

const knownIcons = Object.keys(weatherIcons);

const WeatherIcon = ({ icon }) => {
  if (knownIcons.includes(icon)) {
    return <img src={weatherIcons[icon]} alt="weather icon" />;
  }

  return null;
};

export default React.memo(WeatherIcon);
