"use client";

import { ReactNode } from "react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";

export function ConfirmModal({
  open,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="text-sm text-black/70">{description}</div>
    </Modal>
  );
}
