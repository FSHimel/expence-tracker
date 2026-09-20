"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import CategoryModal from "./AddCategoryModal";
import { deleteCategory, updateCategory } from "@/lib/api";
import { humanizeError, GENERIC_MESSAGE } from "@/lib/errors";

export default function CategoryMenu({ category, onRenamed, onDeleted, align = "right" }) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleRename(name) {
    setBusy(true);
    setError(null);
    try {
      await updateCategory(category.id, { name });
      setOpen(false);
      setRenaming(false);
      onRenamed?.({ ...category, name });
    } catch (err) {
      const message = humanizeError(err, "This field could not be renamed. Please try again.");
      setError(message);
      throw Object.assign(new Error("rename"), { friendly: message });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      await deleteCategory(category.id);
      setConfirming(false);
      onDeleted?.(category);
    } catch (err) {
      setError(humanizeError(err, "This field could not be deleted. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative z-10">
      <button
        type="button"
        className="key h-9 w-9"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Options for ${category.name}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        <MoreHorizontal size={16} aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={`${category.name} options`}
          className={`neu anim-rise absolute top-[calc(100%+0.6rem)] w-40 p-2 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <button
            type="button"
            role="menuitem"
            className="key key-quiet mb-2 h-10 w-full justify-start px-3 text-sm"
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
              setRenaming(true);
            }}
          >
            <Pencil size={15} aria-hidden="true" /> Rename
          </button>
          <button
            type="button"
            role="menuitem"
            className="key h-10 w-full justify-start px-3 text-sm text-danger"
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
              setConfirming(true);
            }}
          >
            <Trash2 size={15} aria-hidden="true" /> Delete
          </button>
        </div>
      ) : null}

      <CategoryModal
        open={renaming}
        mode="rename"
        initialValue={category.name}
        loading={busy}
        onClose={() => {
          setRenaming(false);
          setError(null);
        }}
        onSubmit={handleRename}
      />

      <ConfirmModal
        open={confirming}
        title={`Delete “${category.name}”?`}
        message="This will permanently remove this category and all of its expenses."
        confirmLabel="Delete"
        loading={busy}
        error={error && !renaming ? error : null}
        onCancel={() => {
          setConfirming(false);
          setError(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
