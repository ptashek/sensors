import startOfDay from 'date-fns/startOfDay';
import schema from '../mongoose/schema';
import * as aggregateFields from './aggregateFields'

function getFromDate(fromDate) {
  if (fromDate != null) {
    return new Date(fromDate);
  }
  return startOfDay(new Date());
}

const getToDate = (toDate) => {
  if (toDate != null) {
    return new Date(toDate);
  }
  return new Date();
};

export const searchResolver = async (args, db) => {
  const { sensor, fromDate, toDate, limit, sortOrder = 1 } = args;
  const model = db.model('SensorData', schema, 'sensorData');
  let query = model
    .find({})
    .lean()
    .where('sensor', sensor)
    .where('dt')
    .gte(getFromDate(fromDate))
    .lte(getToDate(toDate))
    .sort({ dt: sortOrder });

  if (limit > 0) {
    query = query.limit(limit);
  }

  return await query.populate().exec();
};

export const aggregateResolver = async (args, db) => {
  const { sensor, fromDate, toDate, bucketCount, sortOrder = 1 } = args;
  const model = db.model('SensorData', schema, 'sensorData');

  const aggregationBucketCount = bucketCount > 0 ? bucketCount : 180;
  const startDate = getFromDate(fromDate);
  const endDate = getToDate(toDate);

  const timeDiff = endDate.getTime() - startDate.getTime();
  const intervalMs = Math.max(1, Math.floor(timeDiff / aggregationBucketCount));
  const intervalSec = Math.floor(intervalMs / 1000);

  const pipeline = [
    {
      $match: {
        sensor,
        dt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $floor: {
            $divide: [{ $subtract: ['$dt', startDate] }, intervalMs],
          },
        },
        sensor: {
          $first: '$sensor',
        },
        dt: {
          $first: '$dt',
        },
        ...aggregateFields.groupByFields,
      },
    },
    {
      $project: {
        _id: '$_id',
        sensor: '$sensor',
        dt: '$dt',
        ...aggregateFields.projectionFields,
      },
    },
    {
      $sort: {
        dt: sortOrder,
      },
    },
  ];

  return await model.aggregate(pipeline).exec();
};
