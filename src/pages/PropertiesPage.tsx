/**
 * Properties Management Page
 * Allows users to manage their properties (hotels, B&Bs, etc.)
 * with WSKEY credentials for Alloggiati Web integration
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from '../components/DashboardLayout';
import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Property {
  id: string;
  property_name: string;
  property_type: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  alloggiati_username: string;
  is_default: boolean;
  last_used_at: string | null;
  total_submissions: number;
  notes: string | null;
  created_at: string;
}

export const PropertiesPage: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Property form state
  const [formData, setFormData] = useState({
    propertyName: '',
    propertyType: 'hotel',
    address: '',
    city: '',
    province: '',
    wskey: '',
    alloggiatiUsername: '',
    notes: ''
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = sessionStorage.getItem('alloggify_token');
      if (!token) {
        setError('Sessione scaduta. Effettua nuovamente il login.');
        return;
      }

      const response = await fetch('/api/properties', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Errore nel caricamento delle strutture');
      }

      const data = await response.json();
      setProperties(data.properties || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = sessionStorage.getItem('alloggify_token');
      if (!token) {
        throw new Error('Sessione scaduta');
      }

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyName: formData.propertyName,
          propertyType: formData.propertyType,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          wskey: formData.wskey,
          alloggiatiUsername: formData.alloggiatiUsername,
          notes: formData.notes,
          setAsDefault: properties.length === 0 // First property is default
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle property limit error
        if (response.status === 403 && data.details) {
          throw new Error(data.details.message);
        }
        throw new Error(data.message || 'Errore nell\'aggiunta della struttura');
      }

      setSuccess(`Struttura "${formData.propertyName}" aggiunta con successo!`);
      setShowAddModal(false);
      setFormData({
        propertyName: '',
        propertyType: 'hotel',
        address: '',
        city: '',
        province: '',
        wskey: '',
        alloggiatiUsername: '',
        notes: ''
      });
      fetchProperties(); // Reload list

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteProperty = async (propertyId: string, propertyName: string) => {
    if (!confirm(`Sei sicuro di voler eliminare la struttura "${propertyName}"?`)) {
      return;
    }

    try {
      const token = sessionStorage.getItem('alloggify_token');
      const response = await fetch('/api/properties', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ propertyId })
      });

      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione della struttura');
      }

      setSuccess(`Struttura "${propertyName}" eliminata`);
      fetchProperties();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const propertyLimit = user?.propertyLimit || 1;
  const canAddMore = properties.length < propertyLimit;

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
            Le Mie Strutture
          </h1>
          <p className="mt-2 text-gray-600">
            Gestisci le tue strutture ricettive e le credenziali Alloggiati Web
          </p>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Strutture: <span className="font-semibold">{properties.length}/{propertyLimit}</span>
            </span>
            {!canAddMore && propertyLimit < 999999 && (
              <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                Limite raggiunto - <a href="/upgrade" className="underline">Upgrade a PRO</a> per strutture illimitate
              </span>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <XCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm text-green-800">{success}</p>
            </div>
            <button onClick={() => setSuccess(null)} className="ml-auto text-green-600 hover:text-green-800">
              ×
            </button>
          </div>
        )}

        {/* Add Property Button */}
        <div className="mb-6">
          <button
            onClick={() => canAddMore && setShowAddModal(true)}
            disabled={!canAddMore}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              canAddMore
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <PlusIcon className="h-5 w-5" />
            Aggiungi Struttura
          </button>
        </div>

        {/* Properties List */}
        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <BuildingOfficeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna struttura configurata</h3>
            <p className="text-gray-600 mb-6">
              Aggiungi la tua prima struttura per iniziare a inviare schedine
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              Aggiungi Prima Struttura
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property.id}
                className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 ${
                  property.is_default ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                {property.is_default && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 bg-primary-50 px-2 py-1 rounded-full">
                      <CheckCircleIcon className="h-4 w-4" />
                      Predefinita
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {property.property_name}
                </h3>

                {property.property_type && (
                  <p className="text-sm text-gray-600 mb-1 capitalize">{property.property_type}</p>
                )}

                {property.city && (
                  <p className="text-sm text-gray-600 mb-3">
                    {property.city}{property.province && ` (${property.province})`}
                  </p>
                )}

                <div className="border-t pt-3 mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Username:</span>
                    <span className="font-medium text-gray-900">{property.alloggiati_username}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Invii totali:</span>
                    <span className="font-medium text-gray-900">{property.total_submissions}</span>
                  </div>
                  {property.last_used_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Ultimo uso:</span>
                      <span className="text-gray-700">
                        {new Date(property.last_used_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  )}
                </div>

                {property.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    {property.notes}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleDeleteProperty(property.id, property.property_name)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Property Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Aggiungi Nuova Struttura</h2>

                <form onSubmit={handleAddProperty} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Struttura *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.propertyName}
                      onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="es. Hotel Bella Vista"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo Struttura
                    </label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="hotel">Hotel</option>
                      <option value="b&b">B&B</option>
                      <option value="agriturismo">Agriturismo</option>
                      <option value="affittacamere">Affittacamere</option>
                      <option value="casa_vacanze">Casa Vacanze</option>
                      <option value="residence">Residence</option>
                      <option value="altro">Altro</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Città
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="es. Roma"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provincia
                      </label>
                      <input
                        type="text"
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="es. RM"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Indirizzo
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="es. Via Roma 123"
                    />
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Credenziali Alloggiati Web
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.alloggiatiUsername}
                        onChange={(e) => setFormData({ ...formData, alloggiatiUsername: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Username Alloggiati Web"
                      />
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WSKEY *
                      </label>
                      <input
                        type="password"
                        required
                        value={formData.wskey}
                        onChange={(e) => setFormData({ ...formData, wskey: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                        placeholder="WSKEY (Web Service Key)"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        La WSKEY verrà crittografata e salvata in modo sicuro
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note (opzionale)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      rows={3}
                      placeholder="Note aggiuntive sulla struttura..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                    >
                      Salva Struttura
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
