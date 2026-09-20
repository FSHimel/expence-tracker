"use client";

import Modal, { ModalHeader, ModalActions, FormError } from "./Modal";
import { Spinner } from "./Loading";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Delete",
  loading = false,
  error,
  onConfirm,
  onCancel,
  titleId = "confirm-title",
}) {
  return (
    <Modal open={open} onClose={loading ? () => {} : onCancel} labelledBy={titleId} maxWidth="25rem">
      <ModalHeader title={title} id={titleId} onClose={onCancel} />
      <p className="mt-3 text-muted">{message}</p>
      <FormError>{error}</FormError>
      <ModalActions>
        <button type="button" className="key px-5 py-2.5" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button
          type="button"
          className="key key-danger px-5 py-2.5"
          onClick={onConfirm}
          disabled={loading}
          autoFocus
        >
          {loading ? <Spinner label="Deleting…" /> : confirmLabel}
        </button>
      </ModalActions>
    </Modal>
  );
}
