
import React, { useState, useEffect } from 'react';
import { Unit, Tenant, Booking, UnitStatus, GuaranteeType, PaymentMethod, DeliveryDetails, COURIER_OPTIONS } from '../types';
import { X, Calendar, User, Calculator, CreditCard, CheckSquare, Activity, Shield, Truck, Clock, Tag, MapPin, Package } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Booking | Omit<Booking, 'id'>) => void;
  units: Unit[];
  tenants: Tenant[];
  initialData?: Booking;
}

const GUARANTEE_OPTIONS: GuaranteeType[] = ['KTP', 'SIM', 'STNK', 'Ijasah', 'Kartu Pelajar', 'Deposit Uang', 'BPKB'];
const PAYMENT_METHODS: PaymentMethod[] = ['Transfer', 'QRIS', 'Cash', 'Debit', 'COD'];

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onSave, units, tenants, initialData }) => {
  const [formData, setFormData] = useState({
    tenantId: '',
    unitIds: [] as string[],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    notes: '',
    customFee: 0,
    discount: 0,
    downPayment: 0,
    paymentMethod: 'Transfer' as PaymentMethod,
    guarantees: [] as GuaranteeType[],
    isDelivery: false,
    status: 'Active' as 'Active' | 'Completed' | 'Cancelled'
  });

  const [deliveryData, setDeliveryData] = useState<Partial<DeliveryDetails>>({
    courierName: '',
    destinationAddress: '',
    scheduledTime: '',
    fee: 0,
    type: 'Antar'
  });

  // Duration State
  const [durationValue, setDurationValue] = useState<number>(1);
  const [durationUnit, setDurationUnit] = useState<'Hari' | 'Minggu' | 'Bulan'>('Hari');

  const [searchTerm, setSearchTerm] = useState('');

  // Reset or Populate form when opened
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit Mode
        setFormData({
          tenantId: initialData.tenantId,
          unitIds: initialData.unitIds,
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          notes: initialData.notes || '',
          customFee: initialData.customFee || 0,
          discount: initialData.discount || 0,
          downPayment: initialData.downPayment,
          paymentMethod: initialData.paymentMethod,
          guarantees: initialData.guarantees,
          isDelivery: initialData.isDelivery,
          status: initialData.status
        });
        
        // Calculate duration based on existing dates for display
        const start = new Date(initialData.startDate);
        const end = new Date(initialData.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        
        // Simple logic to guess unit (optional, defaults to days for accuracy)
        if (diffDays % 30 === 0) {
            setDurationValue(diffDays / 30);
            setDurationUnit('Bulan');
        } else if (diffDays % 7 === 0) {
            setDurationValue(diffDays / 7);
            setDurationUnit('Minggu');
        } else {
            setDurationValue(diffDays);
            setDurationUnit('Hari');
        }

        if (initialData.deliveryDetails) {
          setDeliveryData(initialData.deliveryDetails);
        } else {
           setDeliveryData({
            courierName: '',
            destinationAddress: '',
            scheduledTime: '',
            fee: 0,
            type: 'Antar'
          });
        }
      } else {
        // Create Mode
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        
        setFormData({
          tenantId: '',
          unitIds: [],
          startDate: today,
          endDate: tomorrow,
          notes: '',
          customFee: 0,
          discount: 0,
          downPayment: 0,
          paymentMethod: 'Transfer',
          guarantees: ['KTP'],
          isDelivery: false,
          status: 'Active'
        });
        setDurationValue(1);
        setDurationUnit('Hari');
        setDeliveryData({
          courierName: '',
          destinationAddress: '',
          scheduledTime: '',
          fee: 0,
          type: 'Antar'
        });
      }
      setSearchTerm('');
    }
  }, [isOpen, initialData]);

  const availableUnits = units.filter(u => 
    u.status === UnitStatus.AVAILABLE || (initialData && initialData.unitIds.includes(u.id))
  );
  
  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.phone.includes(searchTerm)
  );

  // Helper to calculate End Date based on Start Date + Duration
  const calculateEndDate = (start: string, val: number, unit: 'Hari' | 'Minggu' | 'Bulan') => {
      const date = new Date(start);
      let daysToAdd = 0;
      
      if (unit === 'Hari') daysToAdd = val;
      if (unit === 'Minggu') daysToAdd = val * 7;
      if (unit === 'Bulan') daysToAdd = val * 30;

      date.setDate(date.getDate() + daysToAdd);
      return date.toISOString().split('T')[0];
  };

  // Handler for Duration Changes
  const handleDurationChange = (val: number, unit: 'Hari' | 'Minggu' | 'Bulan') => {
      setDurationValue(val);
      setDurationUnit(unit);
      
      // Auto update End Date
      const newEndDate = calculateEndDate(formData.startDate, val, unit);
      setFormData(prev => ({ ...prev, endDate: newEndDate }));
  };

  // Handler for Start Date Change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newStart = e.target.value;
      // Auto update End Date based on current duration
      const newEndDate = calculateEndDate(newStart, durationValue, durationUnit);
      setFormData(prev => ({ ...prev, startDate: newStart, endDate: newEndDate }));
  };

  const handleUnitToggle = (unitId: string) => {
    setFormData(prev => {
      const isSelected = prev.unitIds.includes(unitId);
      if (isSelected) {
        return { ...prev, unitIds: prev.unitIds.filter(id => id !== unitId) };
      } else {
        return { ...prev, unitIds: [...prev.unitIds, unitId] };
      }
    });
  };

  const handleGuaranteeToggle = (type: GuaranteeType) => {
    setFormData(prev => {
      const isSelected = prev.guarantees.includes(type);
      if (isSelected) {
        return { ...prev, guarantees: prev.guarantees.filter(g => g !== type) };
      } else {
        return { ...prev, guarantees: [...prev.guarantees, type] };
      }
    });
  };

  const calculateBasePrice = () => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0; 
    
    // Prevent negative calculation if end date is before start date (UI should prevent this but just in case)
    if (diffDays < 0) return 0;

    const selectedUnitsPrice = units
      .filter(u => formData.unitIds.includes(u.id))
      .reduce((sum, u) => {
          // Use promo price if available and lower than normal price
          const effectivePrice = (u.promoPrice && u.promoPrice > 0 && u.promoPrice < u.price) ? u.promoPrice : u.price;
          return sum + effectivePrice;
      }, 0);

    return selectedUnitsPrice * diffDays;
  };

  const calculateTotal = () => {
    const deliveryFee = formData.isDelivery ? (deliveryData.fee || 0) : 0;
    const subtotal = calculateBasePrice() + (formData.customFee || 0) + deliveryFee;
    return Math.max(0, subtotal - (formData.discount || 0));
  };

  const calculateRemaining = () => {
    return calculateTotal() - formData.downPayment;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenantId || formData.unitIds.length === 0) {
      alert("Pilih penyewa dan minimal satu unit.");
      return;
    }

    if (formData.isDelivery && (!deliveryData.destinationAddress || !deliveryData.scheduledTime)) {
        alert("Mohon lengkapi data pengiriman.");
        return;
    }

    const payload = {
      tenantId: formData.tenantId,
      unitIds: formData.unitIds,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalPrice: calculateTotal(),
      customFee: formData.customFee,
      discount: formData.discount,
      status: formData.status,
      notes: formData.notes,
      
      downPayment: formData.downPayment,
      remainingBalance: calculateRemaining(),
      paymentMethod: formData.paymentMethod,
      guarantees: formData.guarantees,
      
      isDelivery: formData.isDelivery,
      deliveryDetails: formData.isDelivery ? (deliveryData as DeliveryDetails) : undefined
    };

    if (initialData) {
        onSave({ ...payload, id: initialData.id });
    } else {
        onSave(payload);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
              {initialData ? 'Edit Transaksi Sewa' : 'Booking Baru'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Rental Info */}
              <div className="space-y-6">
                  {/* Tenant Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Data Penyewa</label>
                    <div className="relative">
                      <select
                        className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none appearance-none bg-white"
                        value={formData.tenantId}
                        onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                        required
                      >
                        <option value="">-- Pilih Penyewa --</option>
                        {filteredTenants.map(t => (
                          <option key={t.id} value={t.id}>{t.name} (HP: {t.phone})</option>
                        ))}
                      </select>
                      <User className="absolute right-3 top-2.5 text-slate-400 w-4 h-4 pointer-events-none"/>
                    </div>
                  </div>

                  {/* Date & Duration Selection */}
                  <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Tgl Mulai</label>
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={handleStartDateChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            required
                          />
                        </div>
                         
                         {/* Duration Input */}
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Durasi</label>
                           <div className="flex gap-2">
                               <input 
                                    type="number" 
                                    min="1"
                                    value={durationValue}
                                    onChange={(e) => handleDurationChange(Number(e.target.value), durationUnit)}
                                    className="w-16 px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-center"
                                />
                                <select 
                                    value={durationUnit}
                                    onChange={(e) => handleDurationChange(durationValue, e.target.value as any)}
                                    className="flex-1 px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                                >
                                    <option value="Hari">Hari</option>
                                    <option value="Minggu">Minggu</option>
                                    <option value="Bulan">Bulan</option>
                                </select>
                           </div>
                        </div>
                      </div>

                      {/* Read-Only End Date (Auto Calculated) */}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                            Tgl Selesai (Otomatis)
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({...formData, endDate: e.target.value})} // Allow manual override
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-600 focus:ring-2 focus:ring-primary outline-none"
                                required
                            />
                            <Clock className="absolute right-3 top-2.5 text-slate-400 w-4 h-4 pointer-events-none"/>
                        </div>
                      </div>
                  </div>

                  {/* Status Selection (Only for Edit) */}
                  {initialData && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status Transaksi</label>
                        <div className="relative">
                            <select
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none appearance-none bg-white"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            >
                                <option value="Active">Active (Sedang Sewa)</option>
                                <option value="Completed">Completed (Selesai)</option>
                                <option value="Cancelled">Cancelled (Batal)</option>
                            </select>
                            <Activity className="absolute left-3 top-2.5 text-slate-400 w-4 h-4 pointer-events-none"/>
                        </div>
                      </div>
                  )}

                  {/* Unit Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Unit Gadget</label>
                    <div className="border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 bg-slate-50">
                      {availableUnits.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-2">Unit habis / tidak tersedia.</p>
                      ) : (
                        availableUnits.map(unit => {
                          const hasPromo = unit.promoPrice && unit.promoPrice > 0;
                          return (
                            <div 
                              key={unit.id} 
                              onClick={() => handleUnitToggle(unit.id)}
                              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-colors ${
                                formData.unitIds.includes(unit.id) 
                                  ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' 
                                  : 'bg-white border-slate-200 hover:border-blue-300'
                              }`}
                            >
                              <div>
                                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                    {unit.name}
                                    {hasPromo && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">PROMO</span>}
                                </p>
                                <div className="text-xs text-slate-500">
                                    {unit.type} • 
                                    {hasPromo ? (
                                        <span>
                                            <span className="line-through text-slate-400 mr-1">{formatCurrency(unit.price)}</span>
                                            <span className="text-red-600 font-bold">{formatCurrency(unit.promoPrice!)}/hr</span>
                                        </span>
                                    ) : (
                                        <span> {formatCurrency(unit.price)}/hr</span>
                                    )}
                                </div>
                                {unit.status !== UnitStatus.AVAILABLE && !initialData?.unitIds.includes(unit.id) && (
                                    <span className="text-[10px] text-red-500 font-medium">({unit.status})</span>
                                )}
                              </div>
                              {formData.unitIds.includes(unit.id) && (
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Security Guarantees */}
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                          <Shield size={16} className="text-emerald-600"/>
                          Jaminan (Security)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                          {GUARANTEE_OPTIONS.map(g => (
                              <label key={g} className="flex items-center gap-2 text-sm p-2 border rounded-lg hover:bg-slate-50 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={formData.guarantees.includes(g)}
                                    onChange={() => handleGuaranteeToggle(g)}
                                    className="rounded text-primary focus:ring-primary"
                                  />
                                  <span className="text-slate-700">{g}</span>
                              </label>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Right Column: Payment & Delivery */}
              <div className="space-y-6">
                  
                  {/* Delivery Service Toggle */}
                  <div className="bg-violet-50 p-4 rounded-xl border border-violet-100">
                      <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-bold text-violet-800 flex items-center gap-2">
                              <Truck size={16}/>
                              Layanan Antar / Jemput
                          </label>
                          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input 
                                type="checkbox" 
                                name="toggle" 
                                id="delivery-toggle" 
                                checked={formData.isDelivery}
                                onChange={(e) => setFormData({...formData, isDelivery: e.target.checked})}
                                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-violet-600"
                                style={{right: formData.isDelivery ? '0' : '50%'}}
                            />
                            <label htmlFor="delivery-toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${formData.isDelivery ? 'bg-violet-600' : 'bg-slate-300'}`}></label>
                        </div>
                      </div>

                      {formData.isDelivery && (
                          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                              {/* Type Selection */}
                              <div className="grid grid-cols-2 gap-2 bg-white rounded-lg p-1 border border-violet-200">
                                  <button
                                      type="button"
                                      onClick={() => setDeliveryData({...deliveryData, type: 'Antar'})}
                                      className={`py-1.5 text-xs font-bold rounded transition-colors ${deliveryData.type === 'Antar' ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:text-slate-700'}`}
                                  >
                                      Antar (Delivery)
                                  </button>
                                   <button
                                      type="button"
                                      onClick={() => setDeliveryData({...deliveryData, type: 'Jemput'})}
                                      className={`py-1.5 text-xs font-bold rounded transition-colors ${deliveryData.type === 'Jemput' ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:text-slate-700'}`}
                                  >
                                      Jemput (Pickup)
                                  </button>
                              </div>

                              <div>
                                  <label className="block text-[10px] font-medium text-violet-700 mb-1">
                                      {deliveryData.type === 'Antar' ? 'Alamat Tujuan' : 'Alamat Penjemputan'}
                                  </label>
                                  <div className="relative">
                                      <MapPin size={14} className="absolute left-3 top-2.5 text-violet-400" />
                                      <input 
                                        type="text"
                                        placeholder="Cth: Jl. Sudirman No. 10..."
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-violet-200 rounded-lg outline-none focus:border-violet-500"
                                        value={deliveryData.destinationAddress}
                                        onChange={(e) => setDeliveryData({...deliveryData, destinationAddress: e.target.value})}
                                      />
                                  </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                  <div>
                                     <label className="block text-[10px] font-medium text-violet-700 mb-1">Nama Kurir</label>
                                     <div className="relative">
                                        <Package size={14} className="absolute left-3 top-2.5 text-violet-400" />
                                        <input 
                                          list="courier-options-booking"
                                          type="text"
                                          placeholder="Pilih / Ketik..."
                                          className="w-full pl-9 pr-3 py-2 text-sm border border-violet-200 rounded-lg outline-none focus:border-violet-500"
                                          value={deliveryData.courierName}
                                          onChange={(e) => setDeliveryData({...deliveryData, courierName: e.target.value})}
                                        />
                                        <datalist id="courier-options-booking">
                                            {COURIER_OPTIONS.map(c => <option key={c} value={c} />)}
                                        </datalist>
                                     </div>
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-medium text-violet-700 mb-1">Jadwal Waktu</label>
                                      <div className="relative">
                                         <Clock size={14} className="absolute left-3 top-2.5 text-violet-400" />
                                         <input 
                                            type="text"
                                            placeholder="14:00 WIB"
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-violet-200 rounded-lg outline-none focus:border-violet-500"
                                            value={deliveryData.scheduledTime}
                                            onChange={(e) => setDeliveryData({...deliveryData, scheduledTime: e.target.value})}
                                          />
                                      </div>
                                  </div>
                              </div>
                              
                              <div>
                                  <label className="block text-[10px] font-medium text-violet-700 mb-1">Biaya Ongkir</label>
                                  <div className="relative">
                                      <span className="absolute left-3 top-2 text-violet-400 text-xs">Rp</span>
                                      <input 
                                        type="number"
                                        placeholder="0"
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-violet-200 rounded-lg outline-none focus:border-violet-500 font-semibold"
                                        value={deliveryData.fee || ''}
                                        onChange={(e) => setDeliveryData({...deliveryData, fee: Number(e.target.value)})}
                                      />
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Financials */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                     <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                         <CreditCard size={16} /> Pembayaran
                     </h3>
                     
                     <div className="grid grid-cols-1 gap-3 mb-3">
                         <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Metode Bayar</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}
                            >
                                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                         </div>
                         
                         <div>
                             <label className="block text-xs font-medium text-slate-500 mb-1">Down Payment (DP)</label>
                             <div className="relative">
                                <span className="absolute left-3 top-2 text-slate-500 text-sm">Rp</span>
                                <input 
                                    type="number"
                                    value={formData.downPayment || ''}
                                    onChange={(e) => setFormData({...formData, downPayment: Number(e.target.value)})}
                                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none font-semibold text-slate-800"
                                    placeholder="0"
                                />
                             </div>
                         </div>
                         
                         <div>
                             <label className="block text-xs font-medium text-slate-500 mb-1">Potongan Harga (Diskon)</label>
                             <div className="relative">
                                <span className="absolute left-3 top-2 text-slate-500 text-sm">Rp</span>
                                <input 
                                    type="number"
                                    value={formData.discount || ''}
                                    onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})}
                                    className="w-full pl-9 pr-3 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="0"
                                />
                             </div>
                         </div>

                         <div>
                             <label className="block text-xs font-medium text-slate-500 mb-1">Biaya Tambahan (Opsional)</label>
                             <div className="relative">
                                <span className="absolute left-3 top-2 text-slate-500 text-sm">Rp</span>
                                <input 
                                    type="number"
                                    value={formData.customFee || ''}
                                    onChange={(e) => setFormData({...formData, customFee: Number(e.target.value)})}
                                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-slate-600"
                                    placeholder="0"
                                />
                             </div>
                         </div>
                     </div>
                     
                     <div className="border-t border-slate-200 pt-3 space-y-1">
                         <div className="flex justify-between text-xs text-slate-500">
                             <span>Sewa Unit ({formData.unitIds.length} item):</span>
                             <span>{formatCurrency(calculateBasePrice())}</span>
                         </div>
                         <div className="flex justify-between text-xs text-slate-400 pl-2">
                            <span>Durasi:</span>
                            <span>{durationValue} {durationUnit}</span>
                         </div>
                         {formData.isDelivery && (
                             <div className="flex justify-between text-xs text-violet-600 font-medium">
                                <span>Ongkos Kirim ({deliveryData.type}):</span>
                                <span>{formatCurrency(deliveryData.fee || 0)}</span>
                            </div>
                         )}
                         {formData.customFee !== 0 && (
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Biaya Lain:</span>
                                <span>{formData.customFee > 0 ? '+' : ''}{formatCurrency(formData.customFee || 0)}</span>
                            </div>
                         )}
                         {formData.discount !== 0 && (
                            <div className="flex justify-between text-xs text-red-500 font-medium">
                                <span>Diskon:</span>
                                <span>-{formatCurrency(formData.discount || 0)}</span>
                            </div>
                         )}
                         <div className="flex justify-between items-center pt-2">
                             <span className="font-bold text-slate-700">Total Tagihan:</span>
                             <span className="font-bold text-lg text-primary">{formatCurrency(calculateTotal())}</span>
                         </div>
                         <div className="flex justify-between items-center text-red-600">
                             <span className="text-xs font-medium">Sisa Bayar (Kurang):</span>
                             <span className="font-bold">{formatCurrency(calculateRemaining())}</span>
                         </div>
                     </div>
                  </div>
              </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white hover:bg-blue-700 rounded-lg font-medium shadow-sm shadow-blue-200 flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4"/>
              {initialData ? 'Update Transaksi' : 'Konfirmasi Sewa'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default BookingModal;