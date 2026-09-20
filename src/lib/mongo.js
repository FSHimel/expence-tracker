import { MongoClient } from "mongodb";

/**
 * One cached MongoDB connection for the whole app.
 *
 * - With MONGODB_URI set, this connects to your MongoDB (Atlas, Docker, …).
 * - Without it, a real mongod is started in-process (mongodb-memory-server) so
 *   the app still runs somewhere without a database server. The data layer is
 *   identical either way.
 */
const CACHE_KEY = "__costlogMongo";

async function startClient() {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    const client = new MongoClient(uri, { maxPoolSize: 10 });
    await client.connect();
    const dbName = process.env.MONGODB_DB_NAME || "costlog";
    return { client, db: client.db(dbName), source: "mongodb" };
  }

  const { MongoMemoryServer } = await import("mongodb-memory-server-core");
  const server = await MongoMemoryServer.create();
  const client = new MongoClient(server.getUri());
  await client.connect();
  return { client, db: client.db("costlog"), source: "embedded", server };
}

export async function getDb() {
  const cached = globalThis[CACHE_KEY];
  if (cached?.db) return cached.db;

  if (!cached?.promise) {
    const entry = { promise: null, db: null };
    globalThis[CACHE_KEY] = entry;
    entry.promise = startClient().then(async (connection) => {
      entry.db = connection.db;
      entry.source = connection.source;
      // Keep the embedded server alive for the lifetime of the process.
      entry.server = connection.server;
      entry.client = connection.client;
      await ensureIndexes(connection.db);
      return connection.db;
    });
  }
  return globalThis[CACHE_KEY].promise;
}

export function getDatabaseSource() {
  return globalThis[CACHE_KEY]?.source || "connecting";
}

async function ensureIndexes(db) {
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("categories").createIndex({ userId: 1, createdAt: -1 }),
    db.collection("expenses").createIndex({ userId: 1, categoryId: 1, createdAt: -1 }),
    db.collection("expenses").createIndex({ userId: 1, date: -1 }),
  ]);
}
