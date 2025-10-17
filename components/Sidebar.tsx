
import React from 'react';

export const Sidebar: React.FC = () => {
    return (
        <aside className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md shadow">
                <h3 className="font-bold text-lg mb-2">ATTENZIONE!</h3>
                <p className="text-sm">
                    Si ribadisce che i gestori di strutture ricettive di ogni genere o tipologia hanno l'obbligo di comunicare le generalità degli alloggiati rilevate dalla carta di identità (o altro documento di identificazione). Pertanto al fine di verificare tale corrispondenza, non sono consentite forme di check-in a distanza o da remoto...
                </p>
            </div>
            <div className="bg-white p-4 rounded-md shadow">
                <h3 className="font-semibold text-lg text-gray-700 mb-2 text-center">Attività</h3>
                <p className="text-sm text-gray-600 text-center">Ultimo Accesso: 17/10/2025 09:13</p>
                <p className="text-sm text-gray-600 text-center">Ultimo Cambio Password: -</p>
            </div>
             <div className="bg-white p-4 rounded-md shadow">
                <h3 className="font-semibold text-lg text-gray-700 mb-2 text-center">Scarica l'Ultima Ricevuta</h3>
                <p className="text-sm text-gray-600 text-center">Nessuna ricevuta disponibile.</p>
            </div>
        </aside>
    );
};
