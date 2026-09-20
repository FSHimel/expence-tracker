"use client";

import CategoryCard from "./CategoryCard";
import EmptyState from "./EmptyState";
import { Layers, Plus } from "lucide-react";

export default function CategoryList({ categories, onRenamed, onDeleted, onCreate }) {
  if (!categories.length) {
    return (
      <EmptyState
        icon={<Layers size={26} aria-hidden="true" />}
        title="Start tracking your expenses"
        description="You haven't created any cost fields yet."
        action={
          <button type="button" className="key key-primary px-5 py-2.5" onClick={onCreate}>
            <Plus size={16} aria-hidden="true" /> Create Cost Field
          </button>
        }
      />
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <li key={category.id} className="anim-rise">
          <CategoryCard category={category} onRenamed={onRenamed} onDeleted={onDeleted} />
        </li>
      ))}
    </ul>
  );
}
