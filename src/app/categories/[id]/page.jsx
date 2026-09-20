"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, ReceiptText, AlertTriangle, RotateCw } from "lucide-react";
import Header from "@/components/Header";
import RequireAuth from "@/components/RequireAuth";
import ExpenseList from "@/components/ExpenseList";
import AddExpenseModal from "@/components/AddExpenseModal";
import EditExpenseModal from "@/components/EditExpenseModal";
import ConfirmModal from "@/components/ConfirmModal";
import SummaryCard from "@/components/SummaryCard";
import CategoryMenu from "@/components/CategoryMenu";
import EmptyState from "@/components/EmptyState";
import { RowSkeleton, Skeleton } from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { useExpenses, summarize } from "@/hooks/useExpenses";
import { addExpense, updateExpense, deleteExpense } from "@/lib/api";
import { formatCurrency } from "@/lib/formatCurrency";
import { humanizeError, GENERIC_MESSAGE } from "@/lib/errors";

export default function CategoryPage() {
  return (
    <RequireAuth>
      <CategoryDetail />
    </RequireAuth>
  );
}

function CategoryDetail() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const categoryId = params?.id;

  const { expenses, setExpenses, category, setCategory, loading, error, refresh } =
    useExpenses(categoryId);

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  const stats = useMemo(() => summarize(expenses), [expenses]);
  const title = category?.name || "Cost Field";

  function applyExpenses(next) {
    setExpenses(next);
    const nextStats = summarize(next);
    setCategory((prev) =>
      prev ? { ...prev, total: nextStats.total, expenseCount: nextStats.count } : prev
    );
  }

  async function handleAdd(values) {
    setBusy(true);
    setActionError(null);
    try {
      const created = await addExpense(categoryId, values);
      applyExpenses([created, ...expenses]);
      setAddOpen(false);
    } catch (err) {
      throw Object.assign(new Error("save"), {
        friendly: humanizeError(err, "This expense could not be added. Please try again."),
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(values) {
    setBusy(true);
    setActionError(null);
    try {
      const updated = await updateExpense(categoryId, editing.id, values);
      applyExpenses(expenses.map((item) => (item.id === editing.id ? { ...item, ...updated } : item)));
      setEditing(null);
    } catch (err) {
      throw Object.assign(new Error("save"), {
        friendly: humanizeError(err, "This expense could not be updated. Please try again."),
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setBusy(true);
    setActionError(null);
    try {
      await deleteExpense(categoryId, deleting.id);
      applyExpenses(expenses.filter((item) => item.id !== deleting.id));
      setDeleting(null);
    } catch (err) {
      setActionError(humanizeError(err, "This expense could not be deleted. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative z-10 min-h-screen">
      <Header />

      <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-8 sm:pt-12">
        <Link
          href="/"
          className="key key-quiet inline-flex h-10 items-center gap-2 px-4 text-sm"
        >
          <ArrowLeft size={15} aria-hidden="true" /> Back
        </Link>

        <header className="mt-8 flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="font-display text-[clamp(2.1rem,5vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.025em]">
              {loading ? <Skeleton className="inline-block h-10 w-52 align-middle" /> : title}
            </h1>
            <p className="mt-2 text-muted">Track all expenses related to this category.</p>
          </div>

          <div className="flex items-center gap-3">
            {!loading && category ? (
              <CategoryMenu
                category={{ ...category, name: title }}
                onRenamed={(updated) => setCategory((prev) => ({ ...prev, name: updated.name }))}
                onDeleted={() => router.replace("/")}
              />
            ) : null}
            <div className="neu-in px-5 py-3 text-right">
              <p className="label-caps">Total</p>
              <p className="tabular mt-1 font-display text-[1.9rem] font-semibold leading-none">
                {loading ? "—" : formatCurrency(stats.total)}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <aside className="lg:order-last">
            <div className="lg:sticky lg:top-24">
              <SummaryCard
                total={stats.total}
                count={stats.count}
                average={stats.average}
                largest={stats.largest}
              />
            </div>
          </aside>

          <section>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-[1.8rem] font-semibold leading-none">Expenses</h2>
              <button
                type="button"
                className="key key-primary h-11 px-5"
                onClick={() => setAddOpen(true)}
              >
                <Plus size={16} aria-hidden="true" /> Add Expense
              </button>
            </div>

            <div className="mt-8">
              {loading ? (
                <div className="flex flex-col gap-4">
                  <RowSkeleton />
                  <RowSkeleton />
                  <RowSkeleton />
                </div>
              ) : error ? (
                <EmptyState
                  icon={<AlertTriangle size={26} aria-hidden="true" />}
                  title="Expenses couldn't be loaded"
                  description={error}
                  action={
                    <button type="button" className="key px-5 py-2.5" onClick={refresh}>
                      <RotateCw size={15} aria-hidden="true" /> Try again
                    </button>
                  }
                />
              ) : expenses.length === 0 ? (
                <EmptyState
                  icon={<ReceiptText size={26} aria-hidden="true" />}
                  title="No expenses yet"
                  description="Start tracking your spending by adding your first expense."
                  action={
                    <button
                      type="button"
                      className="key key-primary px-5 py-2.5"
                      onClick={() => setAddOpen(true)}
                    >
                      <Plus size={16} aria-hidden="true" /> Add Expense
                    </button>
                  }
                />
              ) : (
                <ExpenseList
                  expenses={expenses}
                  onEdit={setEditing}
                  onDelete={setDeleting}
                />
              )}
            </div>

            {actionError ? (
              <p role="alert" className="mt-6 text-sm font-medium text-danger">
                {actionError}
              </p>
            ) : null}
          </section>
        </div>
      </main>

      <AddExpenseModal
        open={addOpen}
        loading={busy}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
      />

      <EditExpenseModal
        open={Boolean(editing)}
        expense={editing}
        loading={busy}
        onClose={() => setEditing(null)}
        onSubmit={handleUpdate}
      />

      <ConfirmModal
        open={Boolean(deleting)}
        title="Delete this expense?"
        message={
          deleting
            ? `Are you sure you want to remove ${deleting.sector} — ${formatCurrency(deleting.amount)}?`
            : ""
        }
        loading={busy}
        error={actionError}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
