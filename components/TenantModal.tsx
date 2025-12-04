
import React, { useState, useEffect } from 'react';
import { Tenant } from '../types';
import { X, User, Phone, Mail, CheckSquare, MapPin, AlertCircle } from 'lucide-react';

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenant: Omit<Tenant, 'id' | 'joinDate'> | Tenant) => void;
  initialData?: Tenant;
}

const TenantModal: React.FC<TenantModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    status: 'Active' as 'Active' | 'Past' | 'Blacklist'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        phone: initialData.phone,
        email: initialData.email,
        address: initialData.address || '',
        status: initialData.status
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        status: 'Active'
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
        alert("Nama dan No HP wajib diisi.");
        return;
    }

    if (initialData) {
        onSave({ ...initialData, ...formData });
    } else {
        onSave(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Data Penyewa' : 'Tambah Penyewa Baru'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
            <div className="relative">
                <User className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Nama Penyewa"
                    required
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nomor WhatsApp / HP</label>
            <div className="relative">
                <Phone className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="08xxxxxxxxxx"
                    required
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Email (Opsional)</label>
            <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="email@example.com"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Domisili</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                    placeholder="Alamat lengkap..."
                    rows={3}
                    required
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status Member</label>
            <div className="relative">
                <AlertCircle className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className={`w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 outline-none appearance-none bg-white ${
                        formData.status === 'Blacklist' ? 'text-red-600 font-bold' : 'text-slate-800'
                    }`}
                >
                    <option value="Active">Active (Aman)</option>
                    <option value="Past">Past (Pernah Sewa)</option>
                    <option value="Blacklist">Blacklist (Bermasalah)</option>
                </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white hover:bg-blue-700 rounded-lg font-medium shadow-sm shadow-blue-200 flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4"/>
              Simpan Data
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default TenantModal;
