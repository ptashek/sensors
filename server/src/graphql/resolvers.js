import startOfDay from "date-fns/startOfDay";
import schema from "../mongoose/schema";

const getFromDate = (fromDate) => {
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
}

export const searchResolver = (args, db) => {
  const { sensor, fromDate, toDate, limit, sortOrder = "asc" } = args;
  const model = db.model("SensorData", schema, "sensorData");
  let query = model
    .find({})
    .lean()
    .where("sensor", sensor)
    .where("dt")
    .gte(getFromDate(fromDate))
    .lte(getToDate(toDate))
    .sort({ dt: sortOrder });

  if (limit > 0) {
    query = query.limit(limit);
  }

  return query
    .populate()
    .exec();
};
