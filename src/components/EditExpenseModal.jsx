"use client";

import ExpenseModal from "./ExpenseModal";

export default function EditExpenseModal(props) {
  return <ExpenseModal {...props} mode="edit" initial={props.expense} />;
}
