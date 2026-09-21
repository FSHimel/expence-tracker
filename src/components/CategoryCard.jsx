"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  FolderKanban,
  GraduationCap,
  Plane,
  ShoppingBag,
  Tag,
  Wallet,
} from "lucide-react";
import CategoryMenu from "./CategoryMenu";
import { formatCurrency } from "@/lib/formatCurrency";

// Category actions are scoped to the signed-in user on the server, so no uid
// is passed around in the UI.

const ICONS = [
  [/study|abroad|visa|ielts|cimea|medical/i, GraduationCap],
  [/educat|school|college|university|course|book|exam/i, BookOpen],
  [/freelanc|client|work|job|business/i, Briefcase],
  [/travel|trip|flight|tour|hotel/i, Plane],
  [/shop|cloth|grocer|gadget|device/i, ShoppingBag],
  [/project|dev|build|side/i, FolderKanban],
  [/personal|self|health|family|life/i, Wallet],
  [/office|company|rent|bill|utilit/i, Building2],
];

export function iconFor(name = "") {
  const match = ICONS.find(([pattern]) => pattern.test(name));
  return match ? match[1] : Tag;
}

export default function CategoryCard({ category, onRenamed, onDeleted }) {
  const Icon = iconFor(category.name);
  const count = Number(category.expenseCount) || 0;

  return (
    <article className="neu relative flex h-full flex-col p-5 transition-shadow duration-150">
      <div className="flex items-start justify-between gap-3">
        <CategoryMenu
          category={category}
          onRenamed={onRenamed}
          onDeleted={onDeleted}
        />
        <span className="neu-in grid h-11 w-11 place-items-center rounded-full text-indigo">
          <Icon size={19} aria-hidden="true" />
        </span>
      </div>

      <h3 className="mt-4 font-display text-[1.3rem] font-semibold leading-snug">
        {category.name}
      </h3>

      <div className="neu-hairline my-4" />

      <p className="label-caps">
        {count} {count === 1 ? "expense" : "expenses"}
      </p>
      <p className="tabular mt-1 font-display text-[1.9rem] font-semibold leading-none">
        {formatCurrency(category.total)}
      </p>

      <Link
        href={`/categories/${category.id}`}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo after:absolute after:inset-0 after:rounded-[20px] after:content-['']"
      >
        View Details
        <ArrowRight size={15} aria-hidden="true" />
        <span className="sr-only">for {category.name}</span>
      </Link>
    </article>
  );
}
