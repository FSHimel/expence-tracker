"use client";

import ExpenseCard from "./ExpenseCard";

export default function ExpenseList({ expenses, onEdit, onDelete }) {
  return (
    <ul className="flex flex-col gap-4">
      {expenses.map((expense) => (
        <ExpenseCard key={expense.id} expense={expense} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}
