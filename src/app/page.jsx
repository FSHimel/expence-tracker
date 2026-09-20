"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Layers, RotateCw, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import RequireAuth from "@/components/RequireAuth";
import CategoryList from "@/components/CategoryList";
import CategoryModal from "@/components/AddCategoryModal";
import { CardSkeleton } from "@/components/Loading";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { useCategories } from "@/hooks/useCategories";
import { createCategory } from "@/lib/api";
import { formatCurrency } from "@/lib/formatCurrency";
import { humanizeError, GENERIC_MESSAGE } from "@/lib/errors";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}

function Dashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { categories, setCategories, loading, error, refresh } = useCategories();

  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState(null);

  const totals = useMemo(() => {
    const total = categories.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const count = categories.reduce((sum, item) => sum + (Number(item.expenseCount) || 0), 0);
    return { total, count };
  }, [categories]);

  const firstName = (profile?.name || user?.displayName || "").split(" ")[0];

  async function handleCreate(name) {
    setCreating(true);
    setActionError(null);
    try {
      const created = await createCategory(name);
      setCategories((prev) => [created, ...prev]);
      setModalOpen(false);
      router.push(`/categories/${created.id}`);
    } catch (err) {
      throw Object.assign(new Error("save"), {
        friendly: humanizeError(err, "This field could not be created. Please try again."),
      });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="relative z-10 min-h-screen">
      <Header />

      <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-10 sm:pt-14">
        <section className="grid items-end gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            {firstName ? <p className="label-caps">Hello, {firstName}</p> : null}
            <h1 className="mt-3 max-w-[13ch] font-display text-[clamp(2.4rem,5.6vw,4rem)] font-semibold leading-[0.98] tracking-[-0.025em]">
              Track where your money goes.
            </h1>
          </div>

          {/* the display window of a desk calculator */}
          <div className="neu-in px-6 py-6 sm:px-8">
            <div className="flex items-baseline justify-between gap-4">
              <p className="label-caps">Total Expenses</p>
              <p className="label-caps">
                {categories.length} cost {categories.length === 1 ? "field" : "fields"}
              </p>
            </div>
            <p className="tabular mt-3 text-right font-display text-[clamp(2.5rem,7vw,4.4rem)] font-semibold leading-none">
              {loading ? "—" : formatCurrency(totals.total)}
            </p>
            <div className="neu-hairline mt-6" />
            <p className="mt-3 text-sm text-muted">
              {totals.count} {totals.count === 1 ? "expense" : "expenses"} recorded across every
              cost field.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-[1.8rem] font-semibold leading-none">My Cost Fields</h2>
              <p className="mt-2 text-sm text-muted">
                Group related costs together and watch the total.
              </p>
            </div>
            <button type="button" className="key key-primary h-11 px-5" onClick={() => setModalOpen(true)}>
              <Plus size={16} aria-hidden="true" /> Add Cost Field
            </button>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : error ? (
              <EmptyState
                icon={<AlertTriangle size={26} aria-hidden="true" />}
                title="Your cost fields couldn't be loaded"
                description={error}
                action={
                  <button type="button" className="key px-5 py-2.5" onClick={() => refresh()}>
                    <RotateCw size={15} aria-hidden="true" /> Try again
                  </button>
                }
              />
            ) : (
              <CategoryList
                categories={categories}
                onCreate={() => setModalOpen(true)}
                onRenamed={(updated) =>
                  setCategories((prev) => prev.map((item) => (item.id === updated.id ? { ...item, name: updated.name } : item)))
                }
                onDeleted={(deleted) =>
                  setCategories((prev) => prev.filter((item) => item.id !== deleted.id))
                }
              />
            )}
          </div>

          {!loading && !error && categories.length > 0 ? (
            <p className="mt-8 flex items-center gap-2 text-sm text-muted">
              <Layers size={15} aria-hidden="true" />
              Everything here is private to your account.
            </p>
          ) : null}
          {actionError ? (
            <p role="alert" className="mt-6 text-sm font-medium text-danger">
              {actionError}
            </p>
          ) : null}
        </section>
      </main>

      <CategoryModal
        open={modalOpen}
        mode="create"
        loading={creating}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
