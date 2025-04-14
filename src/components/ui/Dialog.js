import React from "react";

const Dialog = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded shadow-lg">
        {children}
        <button onClick={onClose} className="mt-2 bg-red-500 text-white px-4 py-2 rounded">
          Cerrar
        </button>
      </div>
    </div>
  );
};

export const DialogContent = ({ children }) => (
  <div className="p-4">{children}</div>
);

export const DialogHeader = ({ children }) => (
  <div className="border-b p-4 font-bold">{children}</div>
);

export const DialogTitle = ({ children }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);

export default Dialog;