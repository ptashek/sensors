import { getUnixTime, startOfDay } from "date-fns";
import schema from "../mongoose/schema";

const getStartTS = start => {
  if (start != null) {
    return start;
  }
  return getUnixTime(startOfDay(new Date()));
};

const getEndTS = end => {
  if (end != null) {
    return end;
  }
  return getUnixTime(new Date());
};

export const searchResolver = (args, db) => {
  const { sensor, start, end, limit, sortOrder = "asc" } = args;
  const model = db.model("SensorData", schema, "sensorData");
  let query = model
    .find({})
    .lean()
    .where("ts")
    .gte(getStartTS(start))
    .lte(getEndTS(end));

  if (sensor != null) {
    query = query.where("sensor", sensor);
  }

  return query
    .sort({ ts: sortOrder })
    .limit(limit)
    .populate()
    .exec();
};
