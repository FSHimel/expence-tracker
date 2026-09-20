"use client";

import { useEffect, useState } from "react";
import Modal, { ModalHeader, ModalActions, FieldError, FormError } from "./Modal";
import { Spinner } from "./Loading";
import { todayISO } from "@/lib/formatCurrency";

/**
 * One form for adding and editing an expense (EditExpenseModal passes
 * mode="edit"). Field-level validation is shared by both.
 */
export default function ExpenseModal({
  open,
  mode = "create",
  initial = null,
  loading = false,
  onClose,
  onSubmit,
}) {
  const [sector, setSector] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Expense" : "Add Expense";
  const titleId = isEdit ? "edit-expense-title" : "add-expense-title";

  useEffect(() => {
    if (!open) return;
    setSector(initial?.sector || "");
    setAmount(initial?.amount != null && initial.amount !== "" ? String(initial.amount) : "");
    setDate(initial?.date || todayISO());
    setErrors({});
    setSubmitError(null);
  }, [open, initial]);

  function validate() {
    const next = {};
    if (!sector.trim()) next.sector = "Please enter what you spent on.";
    const numeric = Number(amount);
    if (amount === "" || amount === null) {
      next.amount = "Amount is required.";
    } else if (!Number.isFinite(numeric)) {
      next.amount = "Amount must be a number.";
    } else if (numeric <= 0) {
      next.amount = "Amount must be greater than 0.";
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) next.date = "Please choose a valid date.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    setSubmitError(null);
    try {
      await onSubmit({ sector: sector.trim(), amount: Number(amount), date });
    } catch (err) {
      setSubmitError(err?.friendly || "This expense could not be saved. Please try again.");
    }
  }

  return (
    <Modal open={open} onClose={loading ? () => {} : onClose} labelledBy={titleId}>
      <ModalHeader title={title} id={titleId} onClose={onClose} />

      <form onSubmit={handleSubmit} noValidate className="mt-6">
        <label htmlFor="expense-sector" className="label-caps block">
          What did you spend on?
        </label>
        <input
          id="expense-sector"
          type="text"
          className="field mt-2"
          placeholder="e.g. University Application Fee"
          value={sector}
          maxLength={80}
          autoComplete="off"
          aria-invalid={Boolean(errors.sector)}
          aria-describedby={errors.sector ? "expense-sector-error" : undefined}
          onChange={(event) => {
            setSector(event.target.value);
            if (errors.sector) setErrors((prev) => ({ ...prev, sector: undefined }));
          }}
        />
        <FieldError id="expense-sector-error">{errors.sector}</FieldError>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="expense-amount" className="label-caps block">
              Amount
            </label>
            <div className="field mt-2 flex items-center gap-2 px-4">
              <span className="text-muted tabular" aria-hidden="true">
                ৳
              </span>
              <input
                id="expense-amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                className="w-full bg-transparent outline-none tabular"
                placeholder="0"
                value={amount}
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={errors.amount ? "expense-amount-error" : undefined}
                onChange={(event) => {
                  setAmount(event.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                }}
              />
            </div>
            <FieldError id="expense-amount-error">{errors.amount}</FieldError>
          </div>

          <div>
            <label htmlFor="expense-date" className="label-caps block">
              Date
            </label>
            <input
              id="expense-date"
              type="date"
              className="field mt-2 tabular"
              value={date}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? "expense-date-error" : undefined}
              onChange={(event) => {
                setDate(event.target.value);
                if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
              }}
            />
            <FieldError id="expense-date-error">{errors.date}</FieldError>
          </div>
        </div>

        <FormError>{submitError}</FormError>

        <ModalActions>
          <button type="button" className="key px-5 py-2.5" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="key key-primary px-5 py-2.5" disabled={loading}>
            {loading ? (
              <Spinner label={isEdit ? "Saving…" : "Adding…"} />
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Add Expense"
            )}
          </button>
        </ModalActions>
      </form>
    </Modal>
  );
}
