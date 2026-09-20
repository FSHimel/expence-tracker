"use client";

import { useCallback, useEffect, useState } from "react";
import { getCategories } from "@/lib/api";
import { humanizeError, GENERIC_MESSAGE } from "@/lib/errors";

/** Loads the signed-in user's cost fields once and keeps them in local state. */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const items = await getCategories();
      setCategories(items);
      setError(null);
    } catch (err) {
      setError(humanizeError(err, GENERIC_MESSAGE));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { categories, setCategories, loading, error, refresh: () => load(true) };
}
