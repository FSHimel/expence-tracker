"use client";

import { formatCurrency } from "@/lib/formatCurrency";

function Row({ label, value, size = "text-[1.35rem]" }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <span className="label-caps">{label}</span>
      <span className={`tabular font-display font-semibold leading-none ${size}`}>
        {value}
      </span>
    </div>
  );
}

export default function SummaryCard({ total, count, average, largest }) {
  return (
    <section className="neu p-6" aria-label="Cost summary">
      <h2 className="font-display text-xl font-semibold">Cost Summary</h2>
      <div className="neu-hairline my-4" />

      <div className="neu-in px-5 py-4">
        <p className="label-caps">Total Cost</p>
        <p className="tabular mt-2 font-display text-[2.6rem] font-semibold leading-none">
          {formatCurrency(total)}
        </p>
      </div>

      <div className="mt-2 divide-y divide-[rgba(196,192,184,0.5)]">
        <Row label="Expenses" value={count} />
        <Row label="Average Expense" value={formatCurrency(average)} />
        <Row label="Largest Expense" value={formatCurrency(largest)} />
      </div>
    </section>
  );
}
