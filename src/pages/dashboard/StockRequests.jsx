import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, RefreshCcw, Search, ExternalLink } from 'lucide-react';
import adminService from '../../services/api/adminService';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export const StockRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, treated
  
  // Confirm dialog state
  const [confirmState, setConfirmState] = useState({ isOpen: false, requestId: null });

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCustomerStockRequests();
      const data = Array.isArray(res) ? res : (res?.data || []);
      setRequests(data);
    } catch (err) {
      console.warn("L'API des demandes de réassort n'est pas encore disponible ou a échoué.", err);
      try {
        const local = JSON.parse(localStorage.getItem('stock_notifications') || '[]');
        setRequests(local);
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleMarkTreated = async (id) => {
    try {
      await adminService.markStockRequestTreated(id);
      loadRequests();
    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err);
      const updated = requests.map(r => r.id === id ? { ...r, status: 'treated' } : r);
      setRequests(updated);
      localStorage.setItem('stock_notifications', JSON.stringify(updated));
    }
    setConfirmState({ isOpen: false, requestId: null });
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      (req.product_name || '').toLowerCase().includes(search.toLowerCase()) || 
      (req.contact || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || req.status === filter;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#6B1A1A] uppercase tracking-widest flex items-center gap-2">
            <Bell size={20} className="text-[#C5A059]" />
            Demandes de Réassort
          </h2>
          <p className="text-sm text-neutral-500 mt-1">Gérez les alertes stock demandées par vos clients.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadRequests}
            className="p-2.5 bg-white border border-neutral-200 rounded text-neutral-600 hover:text-[#6B1A1A] hover:border-[#6B1A1A] transition-colors"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 border border-neutral-200 rounded flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher (Produit, Contact)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded text-sm focus:outline-none focus:border-[#6B1A1A]"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {['all', 'pending', 'treated'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded transition-colors flex-1 md:flex-none ${
                filter === f ? 'bg-[#6B1A1A] text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
              }`}
            >
              {f === 'all' ? 'Toutes' : f === 'pending' ? 'En Attente' : 'Traitées'}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-neutral-200 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-[#C5A059] uppercase text-[10px] tracking-widest font-bold">
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Déclinaison</th>
                <th className="px-6 py-4">Contact Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-neutral-400">Chargement...</td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-neutral-400">Aucune demande trouvée.</td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-800">{req.product_name || `Produit #${req.product_id}`}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-neutral-600 flex gap-2">
                        {req.color && <span className="bg-neutral-100 px-2 py-1 rounded">Couleur: {req.color}</span>}
                        {req.size && <span className="bg-neutral-100 px-2 py-1 rounded">Taille: {req.size}</span>}
                        {!req.color && !req.size && <span className="text-neutral-400">-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{req.contact}</div>
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {new Date(req.date).toLocaleDateString('fr-FR', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {req.status === 'treated' ? (
                        <span className="inline-flex items-center gap-1.5 bg-[#eaf7f0] text-[#2d7a5a] px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle size={12} /> Traitée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-[#fdf6e3] text-[#8a6a1a] px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                          En Attente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status !== 'treated' && (
                        <button
                          onClick={() => setConfirmState({ isOpen: true, requestId: req.id })}
                          className="text-[#6B1A1A] hover:bg-[#6B1A1A]/10 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                        >
                          Marquer Traité
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title="Marquer comme traité"
        message="Avez-vous bien recontacté le client pour l'informer du retour en stock ? Cette action va mettre à jour la demande."
        onConfirm={() => handleMarkTreated(confirmState.requestId)}
        onCancel={() => setConfirmState({ isOpen: false, requestId: null })}
        confirmText="Confirmer"
        cancelText="Annuler"
      />
    </div>
  );
};

export default StockRequests;
