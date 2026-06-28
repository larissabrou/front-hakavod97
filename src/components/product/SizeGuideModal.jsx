import React from 'react';
import { Modal } from '../../ui/Modal';

/**
 * SizeGuideModal – shows a size‑conversion chart or tips.
 * Props:
 *   - isOpen: boolean to control visibility
 *   - onClose: function to close the modal
 */
export const SizeGuideModal = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Guide des pointures" size="md">
    <div className="p-4">
      {/* Example chart – replace with real image or table */}
      <img
        src="https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=800&auto=format&fit=crop&q=80"
        alt="Size guide"
        className="w-full rounded"
      />
      <p className="mt-2 text-sm text-neutral-600">
        Consultez notre guide pour choisir la pointure idéale selon votre pays et votre silhouette.
      </p>
    </div>
  </Modal>
);

export default SizeGuideModal;
