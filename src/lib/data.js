import { ObjectId } from "mongodb";
import { getDb } from "./mongo";
import { HttpError } from "./errors";

/**
 * Every function here takes `userId` and puts it in the query, so a document
 * can only be reached by the person who owns it. Nothing in the UI can widen
 * that: the uid comes from the session on the server, never from the client.
 *
 *   users        { _id, name, email, image, provider, passwordHash, createdAt }
 *   categories   { _id, userId, name, createdAt }
 *   expenses     { _id, userId, categoryId, sector, amount, date, createdAt }
 */

const MAX_NAME = 60;
const MAX_SECTOR = 80;

function users() {
  return getDb().then((db) => db.collection("users"));
}
function categories() {
  return getDb().then((db) => db.collection("categories"));
}
function expenses() {
  return getDb().then((db) => db.collection("expenses"));
}

export function serialize(doc) {
  if (!doc) return null;
  const { _id, passwordHash, userId, ...rest } = doc;
  return { ...rest, id: String(_id) };
}

function isId(value) {
  return typeof value === "string" && ObjectId.isValid(value);
}

function requireId(value, message) {
  if (!isId(value)) throw new HttpError(404, message);
  return new ObjectId(value);
}

/* ------------------------------- validation ------------------------------ */

export function cleanName(raw, label = "Field name") {
  const name = String(raw || "").trim().replace(/\s+/g, " ");
  if (!name) throw new HttpError(400, `${label} is required.`);
  if (name.length > MAX_NAME) {
    throw new HttpError(400, `${label} must be ${MAX_NAME} characters or fewer.`);
  }
  return name;
}

export function cleanExpense(values) {
  const sector = String(values?.sector || "").trim().replace(/\s+/g, " ");
  if (!sector) throw new HttpError(400, "Please enter what you spent on.");
  if (sector.length > MAX_SECTOR) {
    throw new HttpError(400, `Description must be ${MAX_SECTOR} characters or fewer.`);
  }

  const amount = Number(values?.amount);
  if (values?.amount === "" || values?.amount === null || values?.amount === undefined) {
    throw new HttpError(400, "Amount is required.");
  }
  if (!Number.isFinite(amount)) throw new HttpError(400, "Amount must be a number.");
  if (amount <= 0) throw new HttpError(400, "Amount must be greater than 0.");

  const date = String(values?.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new HttpError(400, "Please choose a valid date.");
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) throw new HttpError(400, "Please choose a valid date.");

  return { sector, amount, date };
}

export function cleanEmail(raw) {
  const email = String(raw || "").trim().toLowerCase();
  if (!email) throw new HttpError(400, "Email is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, "Enter a valid email address.");
  }
  return email;
}

/* --------------------------------- users --------------------------------- */

export async function findUserByEmail(email) {
  return (await users()).findOne({ email: String(email || "").trim().toLowerCase() });
}

export async function findUserById(id) {
  if (!isId(id)) return null;
  return (await users()).findOne({ _id: new ObjectId(id) });
}

export async function createUser({ name, email, passwordHash, image = null, provider = "credentials" }) {
  const collection = await users();
  const existing = await collection.findOne({ email });
  if (existing) throw new HttpError(409, "This email is already registered.");
  const doc = {
    name: cleanName(name, "Full name"),
    email,
    image,
    provider,
    passwordHash: passwordHash || null,
    createdAt: new Date(),
  };
  const result = await collection.insertOne(doc);
  return serialize({ ...doc, _id: result.insertedId });
}

/** Google sign-in: create the account the first time, return it after that. */
export async function upsertGoogleUser({ email, name, image }) {
  const collection = await users();
  const normalized = String(email || "").trim().toLowerCase();
  const existing = await collection.findOne({ email: normalized });
  if (existing) {
    if (!existing.image && image) {
      await collection.updateOne({ _id: existing._id }, { $set: { image, name: existing.name || name } });
    }
    return serialize(existing);
  }
  const doc = {
    name: cleanName(name || "Google user", "Full name"),
    email: normalized,
    image: image || null,
    provider: "google",
    passwordHash: null,
    createdAt: new Date(),
  };
  const result = await collection.insertOne(doc);
  return { ...serialize(doc), id: String(result.insertedId) };
}

/* ------------------------------- categories ------------------------------ */

export async function listCategories(userId) {
  const [items, totals] = await Promise.all([
    (await categories()).find({ userId }).sort({ createdAt: -1 }).toArray(),
    (await expenses())
      .aggregate([
        { $match: { userId } },
        { $group: { _id: "$categoryId", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);

  const byCategory = new Map(totals.map((entry) => [String(entry._id), entry]));
  return items.map((item) => {
    const summary = byCategory.get(String(item._id));
    return {
      ...serialize(item),
      total: summary ? summary.total : 0,
      expenseCount: summary ? summary.count : 0,
    };
  });
}

export async function getCategory(userId, categoryId) {
  const _id = requireId(categoryId, "This cost field could not be found.");
  const item = await (await categories()).findOne({ _id, userId });
  if (!item) throw new HttpError(404, "This cost field could not be found.");

  const summary = await (await expenses())
    .aggregate([
      { $match: { userId, categoryId: String(_id) } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ])
    .toArray();

  return {
    ...serialize(item),
    total: summary[0]?.total || 0,
    expenseCount: summary[0]?.count || 0,
  };
}

export async function createCategory(userId, rawName) {
  const name = cleanName(rawName);
  const doc = { userId, name, createdAt: new Date() };
  const result = await (await categories()).insertOne(doc);
  return { ...serialize(doc), id: String(result.insertedId), total: 0, expenseCount: 0 };
}

export async function renameCategory(userId, categoryId, rawName) {
  const _id = requireId(categoryId, "This cost field could not be found.");
  const name = cleanName(rawName);
  const result = await (await categories()).updateOne({ _id, userId }, { $set: { name } });
  if (!result.matchedCount) throw new HttpError(404, "This cost field could not be found.");
  return { id: String(_id), name };
}

/** Deleting a cost field takes its expenses with it. */
export async function deleteCategory(userId, categoryId) {
  const _id = requireId(categoryId, "This cost field could not be found.");
  const key = String(_id);
  const result = await (await categories()).deleteOne({ _id, userId });
  if (!result.deletedCount) throw new HttpError(404, "This cost field could not be found.");
  await (await expenses()).deleteMany({ userId, categoryId: key });
  return { id: key };
}

/* -------------------------------- expenses ------------------------------- */

export async function listExpenses(userId, categoryId) {
  const _id = requireId(categoryId, "This cost field could not be found.");
  const category = await (await categories()).findOne({ _id, userId });
  if (!category) throw new HttpError(404, "This cost field could not be found.");

  const items = await (await expenses())
    .find({ userId, categoryId: String(_id) })
    .sort({ date: -1, createdAt: -1 })
    .toArray();
  return items.map(serialize);
}

export async function addExpense(userId, categoryId, values) {
  const _id = requireId(categoryId, "This cost field could not be found.");
  const category = await (await categories()).findOne({ _id, userId });
  if (!category) throw new HttpError(404, "This cost field could not be found.");

  const payload = cleanExpense(values);
  const doc = { userId, categoryId: String(_id), ...payload, createdAt: new Date() };
  const result = await (await expenses()).insertOne(doc);
  return { ...serialize(doc), id: String(result.insertedId) };
}

export async function updateExpense(userId, categoryId, expenseId, values) {
  const _id = requireId(categoryId, "This cost field could not be found.");
  const expenseObjectId = requireId(expenseId, "This expense could not be found.");
  const payload = cleanExpense(values);

  const result = await (await expenses()).updateOne(
    { _id: expenseObjectId, userId, categoryId: String(_id) },
    { $set: payload }
  );
  if (!result.matchedCount) throw new HttpError(404, "This expense could not be found.");
  return { id: String(expenseObjectId), ...payload };
}

export async function deleteExpense(userId, categoryId, expenseId) {
  const _id = requireId(categoryId, "This cost field could not be found.");
  const expenseObjectId = requireId(expenseId, "This expense could not be found.");
  const result = await (await expenses()).deleteOne({
    _id: expenseObjectId,
    userId,
    categoryId: String(_id),
  });
  if (!result.deletedCount) throw new HttpError(404, "This expense could not be found.");
  return { id: String(expenseObjectId) };
}
