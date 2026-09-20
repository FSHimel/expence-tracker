"use client";

import { Pencil, ReceiptText, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatCurrency";

export default function ExpenseCard({ expense, onEdit, onDelete }) {
  return (
    <li className="neu-sm grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="neu-in grid h-9 w-9 shrink-0 place-items-center rounded-full text-indigo">
          <ReceiptText size={16} aria-hidden="true" />
        </span>
        <p className="truncate font-semibold">{expense.sector}</p>
      </div>
      <p className="tabular font-display text-[1.15rem] font-semibold">
        {formatCurrency(expense.amount)}
      </p>

      <p className="label-caps pl-12">{formatDate(expense.date)}</p>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="key h-9 gap-1.5 px-3 text-sm"
          onClick={() => onEdit(expense)}
          aria-label={`Edit ${expense.sector}`}
        >
          <Pencil size={14} aria-hidden="true" />
          <span aria-hidden="true">Edit</span>
        </button>
        <button
          type="button"
          className="key h-9 gap-1.5 px-3 text-sm text-danger"
          onClick={() => onDelete(expense)}
          aria-label={`Delete ${expense.sector}`}
        >
          <Trash2 size={14} aria-hidden="true" />
          <span aria-hidden="true">Delete</span>
        </button>
      </div>
    </li>
  );
}
