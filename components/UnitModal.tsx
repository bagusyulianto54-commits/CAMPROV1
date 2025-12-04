
import React, { useState, useEffect } from 'react';
import { Unit, UnitType, UnitStatus, DeliveryDetails, UnitSpecs, COURIER_OPTIONS } from '../types';
import { X, Sparkles, Loader2, Truck, Clock, MapPin, User, Info, Database, ShieldCheck, Battery, Camera, Tag, Package } from 'lucide-react';
import { generateUnitDescription } from '../services/geminiService';

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (unit: Omit<Unit, 'id'> | Unit) => void;
  initialData?: Unit;
}

const UnitModal: React.FC<UnitModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Unit>>({
    name: '',
    type: UnitType.CAMERA,
    price: 0,
    promoPrice: undefined,
    status: UnitStatus.AVAILABLE,
    address: '',
    features: [],
    description: '',
    specs: {}
  });

  const [deliveryData, setDeliveryData] = useState<Partial<DeliveryDetails>>({
    courierName: '',
    destinationAddress: '',
    scheduledTime: '',
    fee: 0,
    type: 'Antar'
  });

  // Separate state for specs to handle nested updates easily
  const [specsData, setSpecsData] = useState<Partial<UnitSpecs>>({
      color: '',
      storage: '',
      warranty: '',
      serialNumber: '',
      batteryHealth: undefined,
      shutterCount: undefined,
      sensorType: ''
  });
  
  const [featureInput, setFeatureInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasPromo, setHasPromo] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setHasPromo(!!initialData.promoPrice && initialData.promoPrice > 0);
      if (initialData.specs) {
          setSpecsData(initialData.specs);
      }
      if (initialData.deliveryDetails) {
          setDeliveryData(initialData.deliveryDetails);
      }
    } else {
      // Reset form
      setFormData({
        name: '',
        type: UnitType.CAMERA,
        price: 0,
        promoPrice: undefined,
        status: UnitStatus.AVAILABLE,
        address: '',
        features: [],
        description: '',
      });
      setHasPromo(false);
      setSpecsData({
        color: '',
        storage: '',
        warranty: '',
        serialNumber: '',
        batteryHealth: undefined,
        shutterCount: undefined,
        sensorType: ''
      });
      setDeliveryData({
        courierName: '',
        destinationAddress: '',
        scheduledTime: '',
        fee: 0,
        type: 'Antar'
      });
    }
  }, [initialData, isOpen]);

  // Sync delivery type with status
  useEffect(() => {
    if (formData.status === UnitStatus.DELIVERY) {
        setDeliveryData(prev => ({ ...prev, type: 'Antar' }));
    } else if (formData.status === UnitStatus.PICKUP) {
        setDeliveryData(prev => ({ ...prev, type: 'Jemput' }));
    }
  }, [formData.status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'price' || name === 'promoPrice') ? Number(value) : value
    }));
  };

  const handleSpecChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setSpecsData(prev => ({
          ...prev,
          [name]: (name === 'batteryHealth' || name === 'shutterCount') ? Number(value) : value
      }));
  }

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setDeliveryData(prev => ({
          ...prev,
          [name]: name === 'fee' ? Number(value) : value
      }));
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.address) {
      alert("Mohon isi Nama Unit dan Lokasi Cabang terlebih dahulu.");
      return;
    }
    
    setIsGenerating(true);
    // Include specs in prompt
    const specDetails = [
        specsData.color && `Warna: ${specsData.color}`,
        specsData.storage && `Storage: ${specsData.storage}`,
        specsData.warranty && `Garansi: ${specsData.warranty}`
    ].filter(Boolean).join(', ');

    const fullFeatures = [...(formData.features || [])];
    if(specDetails) fullFeatures.push(specDetails);

    const desc = await generateUnitDescription(
      formData.name || '',
      formData.type || UnitType.CAMERA,
      fullFeatures,
      formData.address || ''
    );
    
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalData = { 
        ...formData,
        promoPrice: hasPromo ? formData.promoPrice : undefined,
        specs: specsData 
    };
    
    // Attach delivery details if status matches
    if (formData.status === UnitStatus.DELIVERY || formData.status === UnitStatus.PICKUP) {
        finalData.deliveryDetails = deliveryData as DeliveryDetails;
    } else {
        finalData.deliveryDetails = undefined;
    }

    onSave(finalData as Unit);
    onClose();
  };

  if (!isOpen) return null;

  const showDeliveryForm = formData.status === UnitStatus.DELIVERY || formData.status === UnitStatus.PICKUP;
  const isIphone = formData.type === UnitType.IPHONE;
  const isCamera = formData.type === UnitType.CAMERA;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Aset' : 'Tambah Aset Gadget'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Unit/Gadget</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="Cth: iPhone 15 Pro, Sony A7III"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                {Object.values(UnitType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Harga Sewa Normal (IDR/Hari)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    min="0"
                    required
                  />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                       <Tag size={14} className={hasPromo ? "text-red-500" : "text-slate-400"}/>
                       Harga Promo / Diskon
                   </label>
                   <div className="flex items-center gap-2 mb-2">
                        <input 
                            type="checkbox" 
                            checked={hasPromo} 
                            onChange={(e) => setHasPromo(e.target.checked)}
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                        />
                        <span className="text-xs text-slate-500">Aktifkan Harga Coret?</span>
                   </div>
                   {hasPromo && (
                       <div className="animate-in fade-in slide-in-from-top-1">
                            <input
                                type="number"
                                name="promoPrice"
                                value={formData.promoPrice || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-red-200 bg-red-50 text-red-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                min="0"
                                placeholder="Harga Promo..."
                            />
                            {formData.price > 0 && formData.promoPrice && formData.promoPrice > 0 && (
                                <p className="text-[10px] text-red-500 mt-1 font-medium">
                                    Hemat {Math.round(((formData.price - formData.promoPrice) / formData.price) * 100)}%
                                </p>
                            )}
                       </div>
                   )}
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status Ketersediaan</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                {Object.values(UnitStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Detailed Specifications Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
             <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                 <Info size={16} className="text-primary"/>
                 Spesifikasi & Kondisi Fisik
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {/* Common Fields */}
                 <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Warna</label>
                    <input 
                        type="text" 
                        name="color"
                        value={specsData.color || ''}
                        onChange={handleSpecChange}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Hitam, Silver..."
                    />
                 </div>
                 
                 <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Serial Number (SN)</label>
                    <input 
                        type="text" 
                        name="serialNumber"
                        value={specsData.serialNumber || ''}
                        onChange={handleSpecChange}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        placeholder="SN12345..."
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Status Garansi</label>
                    <div className="relative">
                        <ShieldCheck size={14} className="absolute left-2.5 top-2.5 text-slate-400"/>
                        <input 
                            type="text" 
                            name="warranty"
                            value={specsData.warranty || ''}
                            onChange={handleSpecChange}
                            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Resmi/Inter/Habis"
                        />
                    </div>
                 </div>

                 {/* iPhone/Storage Specific */}
                 {(isIphone || isCamera) && (
                     <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Internal Storage</label>
                        <div className="relative">
                            <Database size={14} className="absolute left-2.5 top-2.5 text-slate-400"/>
                            <select 
                                name="storage"
                                value={specsData.storage || ''}
                                onChange={handleSpecChange}
                                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                            >
                                <option value="">- Pilih -</option>
                                <option value="64GB">64GB</option>
                                <option value="128GB">128GB</option>
                                <option value="256GB">256GB</option>
                                <option value="512GB">512GB</option>
                                <option value="1TB">1TB</option>
                                <option value="Dual Slot">Dual Slot (Cam)</option>
                            </select>
                        </div>
                     </div>
                 )}

                 {/* iPhone Battery Health */}
                 {isIphone && (
                     <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Battery Health (%)</label>
                        <div className="relative">
                            <Battery size={14} className="absolute left-2.5 top-2.5 text-slate-400"/>
                            <input 
                                type="number" 
                                name="batteryHealth"
                                value={specsData.batteryHealth || ''}
                                onChange={handleSpecChange}
                                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                placeholder="95"
                                min="0" max="100"
                            />
                        </div>
                     </div>
                 )}

                 {/* Camera Shutter Count */}
                 {isCamera && (
                     <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Shutter Count (SC)</label>
                        <div className="relative">
                            <Camera size={14} className="absolute left-2.5 top-2.5 text-slate-400"/>
                            <input 
                                type="number" 
                                name="shutterCount"
                                value={specsData.shutterCount || ''}
                                onChange={handleSpecChange}
                                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                placeholder="5000"
                            />
                        </div>
                     </div>
                 )}
             </div>
          </div>
          
          {/* Dynamic Delivery Form */}
          {showDeliveryForm && (
              <div className="bg-violet-50 p-4 rounded-xl border border-violet-100 animate-in fade-in slide-in-from-top-2">
                  <h3 className="text-sm font-bold text-violet-800 mb-3 flex items-center gap-2">
                      <Truck size={16} />
                      Detail {formData.status === UnitStatus.DELIVERY ? 'Pengiriman' : 'Penjemputan'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Nama Kurir</label>
                        <div className="relative">
                            <Package size={14} className="absolute left-2.5 top-2.5 text-slate-400"/>
                            <input 
                                list="courier-options-unit"
                                type="text" 
                                name="courierName"
                                value={deliveryData.courierName}
                                onChange={handleDeliveryChange}
                                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                                placeholder="Cth: Gojek Instant, JNE"
                            />
                             <datalist id="courier-options-unit">
                                {COURIER_OPTIONS.map(c => <option key={c} value={c} />)}
                            </datalist>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Jadwal Waktu</label>
                        <div className="relative">
                            <Clock size={14} className="absolute left-2.5 top-2.5 text-slate-400"/>
                            <input 
                                type="text" 
                                name="scheduledTime"
                                value={deliveryData.scheduledTime}
                                onChange={handleDeliveryChange}
                                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                                placeholder="Cth: 14:00 WIB"
                            />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Alamat Tujuan/Penjemputan</label>
                        <div className="relative">
                            <MapPin size={14} className="absolute left-2.5 top-2.5 text-slate-400"/>
                            <input 
                                type="text" 
                                name="destinationAddress"
                                value={deliveryData.destinationAddress}
                                onChange={handleDeliveryChange}
                                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                                placeholder="Cth: Jl. Sudirman No. 1..."
                            />
                        </div>
                      </div>
                  </div>
              </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi Penyimpanan / Cabang</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="Cth: Cabang Jakarta Selatan, Rak A-01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kelengkapan Paket (Charger, Box, dll)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="Cth: Baterai 2pcs, Charger, Strap"
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
              >
                Tambah
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.features?.map((f, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                  {f}
                  <button type="button" onClick={() => removeFeature(idx)} className="hover:text-red-500"><X size={14}/></button>
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">Deskripsi Marketing</label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGenerating}
                className="text-xs flex items-center gap-1 text-purple-600 font-medium hover:text-purple-700 bg-purple-50 px-2 py-1 rounded-full transition-colors"
              >
                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {isGenerating ? 'Menulis...' : 'Tulis dengan AI'}
              </button>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
              placeholder="Deskripsi kondisi dan keunggulan unit..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-white hover:bg-blue-700 rounded-lg font-medium shadow-sm shadow-blue-200"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnitModal;