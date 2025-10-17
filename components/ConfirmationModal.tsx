import React from 'react';
import { DocumentData } from '../types';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    data: DocumentData;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, data }) => {
    if (!isOpen) return null;

    const formatLabel = (key: string) => {
        const withSpaces = key.replace(/([A-Z])/g, ' $1');
        return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="relative mx-auto p-6 border w-full max-w-lg shadow-lg rounded-md bg-white">
                <div className="text-center">
                    <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">Conferma Dati Inseriti</h3>
                    <div className="mt-4 px-2 py-3 max-h-96 overflow-y-auto">
                        <dl className="space-y-3 text-left text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                            {Object.entries(data).map(([key, value]) => (
                                <div key={key} className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-2 last:border-b-0">
                                    <dt className="font-semibold text-gray-800">{formatLabel(key)}</dt>
                                    <dd className="text-gray-600 break-words">{value || '-'}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                    <div className="items-center px-4 py-4 sm:px-6 flex justify-center space-x-4">
                        <button
                            id="confirm-button"
                            onClick={onConfirm}
                            className="px-5 py-2 bg-green-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Invia e Compila Nuovo
                        </button>
                        <button
                            id="close-button"
                            onClick={onClose}
                            className="px-5 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                        >
                           Modifica
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
