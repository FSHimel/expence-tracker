"use client";

import ExpenseModal from "./ExpenseModal";

export default function AddExpenseModal(props) {
  return <ExpenseModal {...props} mode="create" />;
}
