import sys
import time
import math
import json
import board
import busio
from adafruit_bme280 import advanced as adafruit_bme280
from syslog import syslog
from urllib.parse import quote_plus
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from pyowm.owm import OWM

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


# Magnus formula dewpoint
# https://en.wikipedia.org/wiki/Dew_point

# Dewpoint formula constants
DP_B = 17.62
DP_C = 243.12


def magnus_dp(temp_c, humidity):
    gamma = (DP_B * temp_c / (DP_C + temp_c)) + math.log(humidity / 100.0)
    return (DP_C * gamma) / (DP_B - gamma)


def get_openweathermap():
    owm_config = None
    owm = None

    try:
        with open('/etc/sensors/openweathermap.json', 'r') as f:
            owm_config = json.loads(f.read())
            owm = OWM(owm_config['key'])
            f.close()
    except Exception as ex:
        print('OpenWeatherMap API setup error: {ex}'.format(ex=ex))
        return None

    if owm:
        weather = owm.weather_manager().weather_at_place(
            owm_config['place']).weather
        temp = weather.temperature('celsius')

        wind = weather.wind()
        wind_gust = 0
        if 'gust' in wind.keys():
            wind_gust = wind['gust']

        precip_type = 'none'
        precip_intensity = 0
        if weather.rain:
            precip_type = 'rain'
            precip_intensity = weather.rain['1h']
        elif weather.snow:
            precip_type = 'snow'
            precip_intensity = weather.snow['1h']

        return {
            'sensor': owm_config['id'],
            'ts': weather.reference_time(timeformat="unix"),
            'dt': weather.reference_time(timeformat="date").astimezone(),
            'units': 'si',
            'summary': weather.detailed_status,
            'icon': weather.weather_icon_name,
            'weather_code': weather.weather_code,
            'temp_c': temp['temp'],
            'humidity': weather.humidity,
            'pressure': weather.pressure['press'],
            'dewpoint': magnus_dp(temp['temp'], weather.humidity),
            'feels_like_c': temp['feels_like'],
            'precip_type': precip_type,
            'precip_intensity': precip_intensity,
            'wind_speed': wind['speed'],
            'wind_gust': wind_gust,
            'wind_bearing': wind['deg'],
            'cloud_cover': weather.clouds,
            'uv_index': weather.uvi,
            'visibility': weather.visibility_distance
        }

    return None


def measure_and_log():
    dt = datetime.now()
    temp_c = bme280.temperature
    pressure = bme280.pressure
    humidity = bme280.humidity
    dewpoint = magnus_dp(temp_c, humidity)

    bme280_data_point = {
        'sensor': 'BME280',
        'ts': dt.timestamp(),
        'dt': dt.astimezone(),
        'temp_c': temp_c,
        'humidity': humidity,
        'pressure': pressure,
        'dewpoint': dewpoint,
    }
    data.insert_one(bme280_data_point)

    print('Fetching OpenWeatherMap data')
    owm_data_point = get_openweathermap()
    if owm_data_point:
        data.insert_one(owm_data_point)

    print('%s\tT: %0.2fC\tH: %0.2f%%\tP: %0.2fhPa' %
          (dt, temp_c, humidity, pressure))
    syslog('T: %0.2fC --- H: %0.2f%% --- P: %0.2fhPa' %
           (temp_c, humidity, pressure))


if __name__ == '__main__':
    measure_and_log()
