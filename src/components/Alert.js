// Alert.js
import React from 'react';

const Alert = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-gray-900 opacity-50" onClick={onClose}></div>

      {/* Alert Box */}
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full z-10 text-center">
        <p className="text-gray-800 text-lg font-medium mb-4">{message}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default Alert;