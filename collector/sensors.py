import sys
import time
import math
import json
import board
import busio
import adafruit_bme280
from syslog import syslog
from urllib.parse import quote_plus
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from darksky.api import DarkSky
from darksky.types import languages, units, weather


# DarkSky setup
darksky_config = None
forecast = None
dt = datetime.now()

try:
    with open('/etc/sensors/darksky.json', 'r') as f:
        darksky_config = json.loads(f.read())
        f.close()
except Exception as ex:
    print('DarkSky API setup error: {ex}'.format(ex=ex))

# MongoDB setup
try:
    with open('/etc/sensors/mongo.json', 'r') as f:
        mongo_config = json.loads(f.read())
        f.close()

    mongo_uri = 'mongodb://{uid}:{pwd}@{host}:{port}'.format(
        uid=quote_plus(mongo_config['uid']),
        pwd=quote_plus(mongo_config['pwd']),
        host=mongo_config['host'],
        port=mongo_config['port']
    )
    mongo = MongoClient(mongo_uri)
    mongo.admin.command('ismaster')
except ConnectionFailure:
    print('MongoDB server not available')
    sys.exit(255)
except Exception as ex:
    print('Mongo DB setup error: {ex}'.format(ex=ex))
    sys.exit(1)

db = mongo[mongo_config['database']]
data = db[mongo_config['collection']]

# BME280 comms via I2C
i2c = busio.I2C(board.SCL, board.SDA)
bme280 = adafruit_bme280.Adafruit_BME280_I2C(i2c)

# BME280 comms via SPI
#spi = busio.SPI(board.SCK, MOSI=board.MOSI, MISO=board.MISO)
#cs = digitalio.DigitalInOut(board.D5)
#bme280 = adafruit_bme280.Adafruit_BME280_SPI(spi, cs)

# Mean Sea Level Pressure for Dublin, Ireland
bme280.sea_level_pressure = 1012

# Sensor mode
# Forced = client controls sampling rate
bme280.mode = adafruit_bme280.MODE_FORCE
# Normal = sensors controls sampling rate
# bme280.mode = adafruit_bme280.MODE_NORMAL
# Sleep = wake-up to measure (default)
# bme280.mode = adafruit_bme280.MODE_SLEEP

# Explicit sensor config
bme280.overscan_temperature = adafruit_bme280.OVERSCAN_X1
bme280.overscan_humidity = adafruit_bme280.OVERSCAN_X4
bme280.overscan_pressure = adafruit_bme280.OVERSCAN_X4
bme280.iir_filter = adafruit_bme280.IIR_FILTER_X2

# print(
#    'Calculated sensor response times\n\ttypical: %0.2fms\tmax: %0.2fms\n\n' % (
#        bme280.measurement_time_typical,
#        bme280.measurement_time_max
#    )
# )

# Dewpoint formula constants
DP_B = 17.62
DP_C = 243.12


def get_forecast():
    if darksky_config:
        darksky = DarkSky(darksky_config['key'])
        return darksky.get_forecast(
            darksky_config['lat'],
            darksky_config['lon'],
            extend=False,
            lang=languages.ENGLISH,  # default `ENGLISH`
            units=units.SU,  # default `auto`
            exclude=[
                weather.MINUTELY,
                weather.HOURLY,
                weather.DAILY,
                weather.ALERTS,
            ]  # default `[]`
        )

# Magnus formula dewpoint
# https://en.wikipedia.org/wiki/Dew_point


def magnus_dp(temp_c, humidity):
    gamma = (DP_B * temp_c / (DP_C + temp_c)) + math.log(humidity / 100.0)
    return (DP_C * gamma) / (DP_B - gamma)


def measure_and_log():
    temp_c = bme280.temperature
    pressure = bme280.pressure
    humidity = bme280.humidity
    dewpoint = magnus_dp(temp_c, humidity)

    bme280_data_point = {
        'sensor': 'BME280',
        'ts': dt.timestamp(),
        'temp_c': temp_c,
        'humidity': humidity,
        'pressure': pressure,
        'dewpoint': dewpoint,
    }

    data.insert_one(bme280_data_point)


    if forecast:
        external_data_point = {
            'sensor': 'DARKSKY',
            'ts': forecast.time.timestamp(),  # meh
            'units': units.SU,
            'summary': forecast.summary,
            'icon': forecast.icon,
            'temp_c': forecast.temperature,
            'humidity': forecast.humidity * 100,
            'pressure': forecast.pressure,
            'dewpoint': forecast.dew_point,
            'feels_like_c': forecast.apparent_temperature,
            'nearest_storm_distance': forecast.nearest_storm_distance,
            'precip_intensity': forecast.precip_intensity,
            'precip_probability': forecast.precip_probability,
            'wind_speed': forecast.wind_speed,
            'wind_gust': forecast.wind_gust,
            'cloud_cover': forecast.cloud_cover,
            'uv_index': forecast.uv_index,
            'visibility': forecast.visibility,
            'ozone': forecast.ozone,
        }

        if forecast.wind_bearing > 0:
            external_data_point['wind_bearing'] = forecast.wind_bearing
        else:
            external_data_point['wind_bearing'] = -1

        if forecast.precip_intensity > 0:
            external_data_point['precip_type'] = forecast.precip_type
        else:
            external_data_point['precip_type'] = 'none'

        data.insert_one(external_data_point)

    print('%s\tT: %0.2fC\tH: %0.2f%%\tP: %0.2fhPa' %
          (dt, temp_c, humidity, pressure))
    syslog('T: %0.2fC --- H: %0.2f%% --- P: %0.2fhPa' %
           (temp_c, humidity, pressure))


if __name__ == '__main__':
    if dt.minute % 2 == 0:
        print('Fetching DarkSky data')
        forecast = get_forecast().currently
    measure_and_log()
