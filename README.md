This project is an environmental sensors monitor for my garage, and complements its heating and humidity control system.

The main task of this part is to collect data from a Bosch BME280 sensor connected to a Raspberry Pi via I2C, and local weather data via [OpenWeatherMap](https://openweathermap.org/). The data is collected via a cron job calling the collector/sensors.py script every minute. This data is then stored in a MongoDB collection. The "consumer" side is a NodeJS server built with Express and Mongoose, with the client API using GraphQL. Client side is built with React and Materual UI, using Relay for data fetching.

This was put together to serve a specific purpose in the minimum amount of time, and yes, there's no tests.
This code has been running great since 2019, collecting over 2.3 million data points (as of June 2022).

License: MIT

![Screenshot](images/sensors.jpg?raw=true "Screenshot")

