import React from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  title = 'Confirmation',
  description = '',
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" className="max-w-md">
      <div className="space-y-6">
        <p className="text-sm leading-6 text-neutral-600">{description}</p>
        <div className="flex flex-col gap-3 sm:flex-row justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Suppression...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
