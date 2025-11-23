/**
 * Receipts Management Page
 * View, search, and download receipts from Alloggiati Web submissions
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Receipt {
  id: string;
  receipt_number: string;
  receipt_date: string;
  guest_name: string | null;
  guest_surname: string | null;
  guest_nationality: string | null;
  property_name: string | null;
  property_id: string | null;
  checkin_date: string | null;
  checkout_date: string | null;
  nights: number | null;
  file_size: number;
  created_at: string;
}

export const ReceiptsPage: React.FC = () => {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReceipts, setSelectedReceipts] = useState<Set<string>>(new Set());

  // Filters
  const [filters, setFilters] = useState({
    guestSurname: '',
    startDate: '',
    endDate: '',
    propertyId: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    fetchReceipts();
  }, [offset, filters]);

  const fetchReceipts = async () => {
    try {
      const token = sessionStorage.getItem('alloggify_token');
      if (!token) {
        setError('Sessione scaduta. Effettua nuovamente il login.');
        return;
      }

      // Build query params
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });

      if (filters.guestSurname) params.append('guestSurname', filters.guestSurname);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.propertyId) params.append('propertyId', filters.propertyId);

      const response = await fetch(`/api/user?resource=receipts&${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Errore nel caricamento delle ricevute');
      }

      const data = await response.json();
      setReceipts(data.receipts || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSingle = async (receiptId: string, receiptNumber: string, guestSurname: string) => {
    try {
      const token = sessionStorage.getItem('alloggify_token');
      const response = await fetch(`/api/user?resource=receipts&action=download&id=${receiptId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Errore nel download della ricevuta');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ricevuta_${receiptNumber}_${guestSurname || 'ospite'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedReceipts.size === 0) {
      alert('Seleziona almeno una ricevuta da scaricare');
      return;
    }

    if (selectedReceipts.size > 50) {
      alert('Puoi scaricare max 50 ricevute alla volta');
      return;
    }

    try {
      const token = sessionStorage.getItem('alloggify_token');
      const response = await fetch(`/api/user?resource=receipts&action=bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiptIds: Array.from(selectedReceipts)
        })
      });

      if (!response.ok) {
        throw new Error('Errore nel download multiplo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ricevute_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSelectedReceipts(new Set());
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleReceipt = (receiptId: string) => {
    const newSelection = new Set(selectedReceipts);
    if (newSelection.has(receiptId)) {
      newSelection.delete(receiptId);
    } else {
      newSelection.add(receiptId);
    }
    setSelectedReceipts(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedReceipts.size === receipts.length) {
      setSelectedReceipts(new Set());
    } else {
      setSelectedReceipts(new Set(receipts.map(r => r.id)));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <DocumentTextIcon className="h-8 w-8 text-primary-600" />
            Le Mie Ricevute
          </h1>
          <p className="mt-2 text-gray-600">
            Archivio completo delle ricevute Alloggiati Web
          </p>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Totale ricevute: <span className="font-semibold">{total}</span>
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <XMarkIcon className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
              ×
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5" />
            Filtri
          </button>

          {selectedReceipts.size > 0 && (
            <>
              <span className="text-sm text-gray-600">
                {selectedReceipts.size} selezionate
              </span>
              <button
                onClick={handleBulkDownload}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Scarica Selezionate (ZIP)
              </button>
              <button
                onClick={() => setSelectedReceipts(new Set())}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Deseleziona tutto
              </button>
            </>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Filtri Ricerca</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cognome Ospite
                </label>
                <input
                  type="text"
                  value={filters.guestSurname}
                  onChange={(e) => setFilters({ ...filters, guestSurname: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="es. Rossi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Inizio
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Fine
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ guestSurname: '', startDate: '', endDate: '', propertyId: '' });
                    setOffset(0);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Reset Filtri
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receipts Table */}
        {receipts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna ricevuta trovata</h3>
            <p className="text-gray-600">
              Le ricevute verranno salvate automaticamente dopo ogni invio schedina
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedReceipts.size === receipts.length && receipts.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N. Ricevuta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ospite
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Struttura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dimensione
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {receipts.map((receipt) => (
                    <tr key={receipt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedReceipts.has(receipt.id)}
                          onChange={() => toggleReceipt(receipt.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{receipt.receipt_number}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(receipt.receipt_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {receipt.guest_surname ? `${receipt.guest_surname} ${receipt.guest_name || ''}` : '-'}
                          </div>
                          {receipt.guest_nationality && (
                            <div className="text-gray-500">{receipt.guest_nationality}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {receipt.property_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {receipt.checkin_date ? formatDate(receipt.checkin_date) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {receipt.nights || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(receipt.file_size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDownloadSingle(receipt.id, receipt.receipt_number, receipt.guest_surname || '')}
                          className="text-primary-600 hover:text-primary-900 inline-flex items-center gap-1"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                          Scarica
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Precedente
                  </button>
                  <button
                    onClick={() => setOffset(Math.min((totalPages - 1) * limit, offset + limit))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Successiva
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando{' '}
                      <span className="font-medium">{offset + 1}</span> -{' '}
                      <span className="font-medium">{Math.min(offset + limit, total)}</span> di{' '}
                      <span className="font-medium">{total}</span> ricevute
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setOffset(Math.max(0, offset - limit))}
                        disabled={offset === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        ‹
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        Pagina {currentPage} di {totalPages}
                      </span>
                      <button
                        onClick={() => setOffset(Math.min((totalPages - 1) * limit, offset + limit))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        ›
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
