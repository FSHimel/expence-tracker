"use client";

import { useCallback, useEffect, useState } from "react";
import { getCategory, getExpenses } from "@/lib/api";
import { humanizeError, GENERIC_MESSAGE } from "@/lib/errors";

/** Loads one cost field and its expenses (newest first). */
export function useExpenses(categoryId) {
  const [expenses, setExpenses] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    if (!categoryId) return undefined;
    setLoading(true);
    (async () => {
      try {
        const [items, meta] = await Promise.all([getExpenses(categoryId), getCategory(categoryId)]);
        if (!active) return;
        setExpenses(items);
        setCategory(meta);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(humanizeError(err, GENERIC_MESSAGE));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [categoryId, reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  return { expenses, setExpenses, category, setCategory, loading, error, refresh };
}

/** Total / count / average / largest for a list of expenses. */
export function summarize(items = []) {
  const count = items.length;
  const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const largest = items.reduce((max, item) => Math.max(max, Number(item.amount) || 0), 0);
  return { count, total, largest, average: count ? Math.round(total / count) : 0 };
}
