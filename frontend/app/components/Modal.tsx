"use client";

import React from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-md rounded bg-white p-6 text-black">
          <DialogTitle className="font-bold text-xl">{title}</DialogTitle>
          <div className="mt-4">{children}</div>
          {/* <button
            onClick={onClose}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
          >
            Close
          </button> */}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default Modal;
