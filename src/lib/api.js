/**
 * Browser-side data access. Every call goes to an API route that reads the
 * session and scopes the query to that user — the client never sends a uid.
 */
async function request(path, { method = "GET", body } = {}) {
  let response;
  try {
    response = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    const error = new Error("Network unavailable. Check your connection and try again.");
    error.friendly = error.message;
    throw error;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error || "Something went wrong. Please try again.");
    error.friendly = error.message;
    error.status = response.status;
    throw error;
  }
  return data;
}

/* ------------------------------- accounts -------------------------------- */

export function registerAccount(payload) {
  return request("/api/auth/register", { method: "POST", body: payload });
}

/* ------------------------------- categories ------------------------------ */

export async function getCategories() {
  const data = await request("/api/categories");
  return data.categories;
}

export async function getCategory(categoryId) {
  const data = await request(`/api/categories/${categoryId}`);
  return data.category;
}

export async function createCategory(name) {
  const data = await request("/api/categories", { method: "POST", body: { name } });
  return data.category;
}

export async function updateCategory(categoryId, patch) {
  const data = await request(`/api/categories/${categoryId}`, { method: "PATCH", body: patch });
  return data.category;
}

export function deleteCategory(categoryId) {
  return request(`/api/categories/${categoryId}`, { method: "DELETE" });
}

/* -------------------------------- expenses ------------------------------- */

export async function getExpenses(categoryId) {
  const data = await request(`/api/categories/${categoryId}/expenses`);
  return data.expenses;
}

export async function addExpense(categoryId, values) {
  const data = await request(`/api/categories/${categoryId}/expenses`, {
    method: "POST",
    body: values,
  });
  return data.expense;
}

export async function updateExpense(categoryId, expenseId, values) {
  const data = await request(`/api/categories/${categoryId}/expenses/${expenseId}`, {
    method: "PATCH",
    body: values,
  });
  return data.expense;
}

export function deleteExpense(categoryId, expenseId) {
  return request(`/api/categories/${categoryId}/expenses/${expenseId}`, { method: "DELETE" });
}
