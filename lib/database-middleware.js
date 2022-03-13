import { MongoClient } from "mongodb";

const withDatabase = (handler, collectionName) => {
  return async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    req.db = client.db(process.env.MONGODB_DB).collection(collectionName);
    return handler(req, res);
  };
};

export default withDatabase;