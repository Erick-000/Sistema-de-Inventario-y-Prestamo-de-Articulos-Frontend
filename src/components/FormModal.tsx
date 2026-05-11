"use client";

import { ReactNode } from "react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";

export function FormModal({
  open,
  title,
  children,
  submitText,
  cancelText,
  onSubmit,
  onClose,
  submitDisabled,
  size = "lg",
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  submitText: string;
  cancelText: string;
  onSubmit: () => void;
  onClose: () => void;
  submitDisabled?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      size={size}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="secondary" onClick={onSubmit} disabled={submitDisabled}>
            {submitText}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
