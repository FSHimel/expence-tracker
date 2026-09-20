"use client";

import { useEffect, useState } from "react";
import Modal, { ModalHeader, ModalActions, FieldError, FormError } from "./Modal";
import { Spinner } from "./Loading";

/**
 * Used for both creating and renaming a cost field.
 * Validation lives here so every entry point is validated the same way.
 */
export default function CategoryModal({
  open,
  mode = "create",
  initialValue = "",
  loading = false,
  onClose,
  onSubmit,
}) {
  const [name, setName] = useState(initialValue);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const isRename = mode === "rename";
  const title = isRename ? "Rename Cost Field" : "Create Cost Field";
  const titleId = isRename ? "rename-field-title" : "create-field-title";

  useEffect(() => {
    if (open) {
      setName(initialValue);
      setError(null);
      setSubmitError(null);
    }
  }, [open, initialValue]);

  async function handleSubmit(event) {
    event.preventDefault();
    const value = name.trim();
    if (!value) {
      setError("Field name is required.");
      return;
    }
    if (value.length > 60) {
      setError("Field name must be 60 characters or fewer.");
      return;
    }
    setError(null);
    setSubmitError(null);
    try {
      await onSubmit(value);
    } catch (err) {
      setSubmitError(err?.friendly || "This field could not be saved. Please try again.");
    }
  }

  return (
    <Modal open={open} onClose={loading ? () => {} : onClose} labelledBy={titleId}>
      <ModalHeader title={title} id={titleId} onClose={onClose} />
      <form onSubmit={handleSubmit} noValidate className="mt-6">
        <label htmlFor="category-name" className="label-caps block">
          Field Name
        </label>
        <input
          id="category-name"
          name="category-name"
          type="text"
          className="field mt-2"
          placeholder="e.g. Study Abroad"
          value={name}
          maxLength={60}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "category-name-error" : undefined}
          onChange={(event) => {
            setName(event.target.value);
            if (error) setError(null);
          }}
        />
        <FieldError id="category-name-error">{error}</FieldError>
        <FormError>{submitError}</FormError>

        <ModalActions>
          <button type="button" className="key px-5 py-2.5" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="key key-primary px-5 py-2.5" disabled={loading}>
            {loading ? (
              <Spinner label={isRename ? "Saving…" : "Creating…"} />
            ) : isRename ? (
              "Save Changes"
            ) : (
              "Create Field"
            )}
          </button>
        </ModalActions>
      </form>
    </Modal>
  );
}
