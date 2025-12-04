import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Camera, 
  Smartphone,
  Users, 
  Settings, 
  Menu, 
  X,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Package,
  Wrench,
  CheckCircle,
  AlertCircle,
  Truck,
  Clock,
  ArrowRightLeft,
  Banknote,
  TrendingUp,
  CalendarRange,
  Wallet,
  CalendarCheck,
  ReceiptText,
  Download,
  ChevronUp,
  ChevronDown,
  Database,
  ShieldCheck,
  Battery,
  Shield,
  Filter,
  AlertTriangle,
  Aperture,
  Zap,
  LayoutGrid,
  History,
  Calendar,
  Tag,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Bell,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Trophy,
  ShoppingBag,
  LucideIcon,
  ClipboardList
} from 'lucide-react';
import { Unit, Tenant, UnitStatus, UnitType, Booking } from './types';
import StatCard from './components/StatCard';
import UnitModal from './components/UnitModal';
import BookingModal from './components/BookingModal';
import TenantModal from './components/TenantModal';
import BottomNav from './components/BottomNav';
import CalendarView from './components/CalendarView';
import { analyzeMarketTips } from './services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import { startOfWeek, startOfMonth, isSameDay, isSameWeek, isSameMonth, parseISO, format, addDays, isWithinInterval, subMonths, addMonths, endOfMonth, eachDayOfInterval, getWeek, getYear } from 'date-fns';

// --- Mock Data ---
const MOCK_UNITS: Unit[] = [
  {
    id: 'u1',
    name: 'Sony Alpha a7 III Kit',
    type: UnitType.CAMERA,
    price: 350000, // Daily rate
    promoPrice: 300000,
    status: UnitStatus.OCCUPIED,
    address: 'Cabang Jakarta Selatan',
    features: ['Lensa 28-70mm', '2 Baterai', 'Strap', 'Memory 64GB'],
    description: 'Kamera full-frame andalan videografer dan fotografer. Kondisi sensor bersih, karet kencang.',
    tenantId: 'CS001',
    specs: {
        color: 'Hitam',
        storage: 'Dual Slot',
        shutterCount: 15420,
        warranty: 'Expired (Ex-Sony Indonesia)',
        sensorType: 'Full Frame'
    }
  },
  {
    id: 'u2',
    name: 'iPhone 15 Pro Max',
    type: UnitType.IPHONE,
    price: 500000,
    status: UnitStatus.AVAILABLE,
    address: 'Gudang Pusat',
    features: ['Charger 20W', 'Cable C-to-C', 'Clear Case', 'Tempered Glass'],
    description: 'Flagship terbaru Apple dengan body titanium. Battery Health 100%, performa kencang untuk content creator.',
    specs: {
        color: 'Natural Titanium',
        storage: '256GB',
        batteryHealth: 100,
        warranty: 'iBox Active s.d Nov 2024',
        serialNumber: 'LX928392'
    }
  },
  {
    id: 'u3',
    name: 'Canon EOS R5 Body Only',
    type: UnitType.CAMERA,
    price: 750000,
    status: UnitStatus.MAINTENANCE,
    address: 'Service Center',
    features: ['Body Cap', '1 Baterai LP-E6NH', 'Charger'],
    description: 'Kamera mirrorless 8K. Sedang pembersihan sensor rutin.',
    specs: {
        color: 'Hitam',
        shutterCount: 8500,
        sensorType: 'Full Frame',
        warranty: 'Distributor'
    }
  },
  {
    id: 'u4',
    name: 'Sony GM 24-70mm f/2.8 II',
    type: UnitType.LENS,
    price: 300000,
    status: UnitStatus.DELIVERY,
    address: 'Dalam Perjalanan',
    features: ['Lens Hood', 'Pouch', 'Front/Rear Cap'],
    description: 'Lensa zoom standar terbaik dari Sony. Tajam di semua bukaan.',
    deliveryDetails: {
        courierName: 'Gojek Instant',
        destinationAddress: 'Jl. Melati No. 45',
        scheduledTime: '14:00 WIB',
        fee: 25000,
        type: 'Antar'
    }
  },
];

const MOCK_TENANTS: Tenant[] = [
  {
    id: 'CS001',
    name: 'Budi Santoso',
    phone: '081234567890',
    email: 'budi@example.com',
    address: 'Jl. Kebon Jeruk No. 12, Jakarta Barat',
    joinDate: '2023-10-15',
    status: 'Active',
    unitId: 'u1',
  },
  {
    id: 'CS002',
    name: 'Siti Aminah',
    phone: '089876543210',
    email: 'siti@example.com',
    address: 'Apartemen Green Pramuka, Tower F, Lt 12',
    joinDate: '2023-11-20',
    status: 'Past',
  },
  {
    id: 'CS003',
    name: 'Rudi Hermawan',
    phone: '081122334455',
    email: 'rudi.h@gmail.com',
    address: 'Jl. Kaliurang Km 5, Yogyakarta',
    joinDate: '2023-01-10',
    status: 'Blacklist'
  }
];

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'BK-001',
    tenantId: 'CS001',
    unitIds: ['u1'], // Sony A7III
    startDate: '2023-10-25',
    endDate: '2023-10-27',
    totalPrice: 600000,
    status: 'Active',
    notes: 'Sewa untuk wedding job. Pakai harga promo.',
    downPayment: 300000,
    remainingBalance: 300000,
    paymentMethod: 'Transfer',
    guarantees: ['KTP', 'SIM'],
    isDelivery: false
  },
  {
    id: 'BK-002',
    tenantId: 'CS002',
    unitIds: ['u2'], // iPhone 15
    startDate: '2023-11-01',
    endDate: '2023-11-03',
    totalPrice: 1000000,
    status: 'Completed',
    downPayment: 1000000,
    remainingBalance: 0,
    paymentMethod: 'QRIS',
    guarantees: ['KTP', 'Kartu Pelajar'],
    isDelivery: true,
    deliveryDetails: {
        courierName: 'GrabExpress',
        destinationAddress: 'Jl. Sudirman',
        scheduledTime: '10:00',
        fee: 20000,
        type: 'Antar'
    }
  },
  {
    id: 'BK-003',
    tenantId: 'CS001',
    unitIds: ['u4'], 
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    totalPrice: 325000,
    status: 'Active',
    downPayment: 325000,
    remainingBalance: 0,
    paymentMethod: 'Transfer',
    guarantees: [],
    isDelivery: true,
    deliveryDetails: {
        courierName: 'Gojek Instant',
        destinationAddress: 'Jl. Melati No. 45',
        scheduledTime: '14:00 WIB',
        fee: 25000,
        type: 'Antar'
    }
  }
];

// --- Helper Functions for CSV Export ---
const downloadCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diekspor.");
    return;
  }
  
  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Convert object to csv string
  const csvRows = [];
  csvRows.push(headers.join(',')); // Header row
  
  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + (row[header] ?? '')).replace(/"/g, '\\"'); // Handle quotes
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const App = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'units' | 'tenants' | 'bookings' | 'calendar' | 'logistics' | 'revenue' | 'unit-reports'>('dashboard');
  const [units, setUnits] = useState<Unit[]>(MOCK_UNITS);
  const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  
  // Modals
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | undefined>(undefined);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | undefined>(undefined);

  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | undefined>(undefined);

  // Filters & UI State
  const [unitStatusFilter, setUnitStatusFilter] = useState<UnitStatus | 'ALL'>('ALL');
  const [unitCategoryFilter, setUnitCategoryFilter] = useState<UnitType | 'ALL'>('ALL');
  const [unitSearchTerm, setUnitSearchTerm] = useState('');
  
  // New Search States
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'ALL' | 'Active' | 'Completed' | 'Cancelled'>('ALL');
  const [logisticsSearchTerm, setLogisticsSearchTerm] = useState('');
  
  // Revenue / Finance Date State
  const [currentRevenueDate, setCurrentRevenueDate] = useState(new Date());
  
  // Unit Report Date State
  const [currentUnitReportDate, setCurrentUnitReportDate] = useState(new Date());

  // Delete States
  const [deleteTarget, setDeleteTarget] = useState<{id: string, name: string} | null>(null);
  const [deleteBookingTarget, setDeleteBookingTarget] = useState<{id: string, tenantName: string} | null>(null);

  // Tenant Features
  const [tenantSearchTerm, setTenantSearchTerm] = useState('');
  const [selectedTenantHistory, setSelectedTenantHistory] = useState<string | null>(null);

  // Notification State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Handle click outside notification dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- Handlers ---

  const handleSaveUnit = (unitData: Omit<Unit, 'id'> | Unit) => {
    if ('id' in unitData) {
      setUnits(prev => prev.map(u => u.id === unitData.id ? unitData as Unit : u));
    } else {
      const newUnit = { ...unitData, id: Math.random().toString(36).substr(2, 9) } as Unit;
      setUnits(prev => [...prev, newUnit]);
    }
  };

  const confirmDeleteUnit = (id: string, name: string) => {
      setDeleteTarget({ id, name });
  };

  const handleDeleteUnit = () => {
    if (deleteTarget) {
        setUnits(prev => prev.filter(u => u.id !== deleteTarget.id));
        setDeleteTarget(null);
    }
  };

  const confirmDeleteBooking = (id: string, tenantName: string) => {
      setDeleteBookingTarget({ id, tenantName });
  };

  const handleDeleteBooking = () => {
      if (deleteBookingTarget) {
          const bookingToDelete = bookings.find(b => b.id === deleteBookingTarget.id);
          
          // If the booking is active, we must revert the associated units to AVAILABLE
          if (bookingToDelete && bookingToDelete.status === 'Active') {
              setUnits(prevUnits => prevUnits.map(u => {
                  if (bookingToDelete.unitIds.includes(u.id)) {
                      return { 
                          ...u, 
                          status: UnitStatus.AVAILABLE, 
                          tenantId: undefined, 
                          deliveryDetails: undefined 
                      };
                  }
                  return u;
              }));
          }

          setBookings(prev => prev.filter(b => b.id !== deleteBookingTarget.id));
          setDeleteBookingTarget(null);
      }
  };

  const handleSaveTenant = (tenantData: Omit<Tenant, 'id' | 'joinDate'> | Tenant) => {
    if ('id' in tenantData) {
      // Edit existing
      setTenants(prev => prev.map(t => t.id === tenantData.id ? tenantData as Tenant : t));
    } else {
      // Create New with Auto-Increment ID (CSxxx)
      
      // Find the highest existing ID number
      let maxIdNum = 0;
      tenants.forEach(t => {
          if (t.id.startsWith('CS')) {
              const num = parseInt(t.id.substring(2)); // Remove 'CS' and parse
              if (!isNaN(num) && num > maxIdNum) {
                  maxIdNum = num;
              }
          }
      });
      
      const nextNum = maxIdNum + 1;
      // Pad with zeros to 3 digits (e.g., 1 -> 001, 10 -> 010)
      const newId = `CS${nextNum.toString().padStart(3, '0')}`;

      const newTenant = {
        ...tenantData,
        id: newId,
        joinDate: new Date().toISOString().split('T')[0]
      } as Tenant;
      setTenants(prev => [...prev, newTenant]);
    }
  };

  const handleSaveBooking = (bookingData: Booking | Omit<Booking, 'id'>) => {
    let newBooking: Booking;
    let oldBooking: Booking | undefined;

    if ('id' in bookingData) {
       // Edit Mode
       newBooking = bookingData as Booking;
       oldBooking = bookings.find(b => b.id === bookingData.id);
       setBookings(prev => prev.map(b => b.id === bookingData.id ? newBooking : b));
    } else {
       // Create Mode
       newBooking = { 
           ...bookingData, 
           id: `BK-${Date.now().toString().substr(-6)}` 
       } as Booking;
       setBookings(prev => [newBooking, ...prev]);
    }

    // --- Unit Status Synchronization ---
    
    // 1. Revert units from the OLD booking to AVAILABLE first (if editing)
    let unitsToRevert: string[] = [];
    if (oldBooking) {
        unitsToRevert = oldBooking.unitIds;
    }

    // 2. Determine the new status for units in the NEW booking
    let targetStatus = UnitStatus.AVAILABLE;
    if (newBooking.status === 'Active') {
        if (newBooking.isDelivery && newBooking.deliveryDetails) {
            targetStatus = newBooking.deliveryDetails.type === 'Jemput' ? UnitStatus.PICKUP : UnitStatus.DELIVERY;
        } else {
            targetStatus = UnitStatus.OCCUPIED;
        }
    } else if (newBooking.status === 'Completed') {
        targetStatus = UnitStatus.AVAILABLE;
    } else if (newBooking.status === 'Cancelled') {
        targetStatus = UnitStatus.AVAILABLE;
    }

    setUnits(prevUnits => {
        return prevUnits.map(unit => {
            // Revert old units
            if (unitsToRevert.includes(unit.id)) {
                 unit = { ...unit, status: UnitStatus.AVAILABLE, tenantId: undefined, deliveryDetails: undefined };
            }

            // Apply new status
            if (newBooking.unitIds.includes(unit.id)) {
                if (targetStatus === UnitStatus.AVAILABLE) {
                     return { ...unit, status: UnitStatus.AVAILABLE, tenantId: undefined, deliveryDetails: undefined };
                } else {
                     return { 
                         ...unit, 
                         status: targetStatus, 
                         tenantId: newBooking.tenantId,
                         deliveryDetails: newBooking.isDelivery ? newBooking.deliveryDetails : undefined
                     };
                }
            }
            return unit;
        });
    });
  };

  // --- Derived Stats ---
  const stats = useMemo(() => {
    const total = units.length;
    const occupied = units.filter(u => u.status === UnitStatus.OCCUPIED).length;
    const maintenance = units.filter(u => u.status === UnitStatus.MAINTENANCE).length;
    const delivery = units.filter(u => u.status === UnitStatus.DELIVERY || u.status === UnitStatus.PICKUP).length;
    const available = total - occupied - maintenance - delivery;
    
    // Calculate total revenue from Active and Completed bookings
    const totalRevenue = bookings
        .filter(b => b.status !== 'Cancelled')
        .reduce((sum, b) => sum + b.totalPrice, 0);

    return {
      totalUnits: total,
      occupiedUnits: occupied,
      availableUnits: available,
      maintenanceUnits: maintenance,
      deliveryUnits: delivery,
      totalRevenue,
      occupancyRate: total > 0 ? Math.round(((occupied + delivery) / total) * 100) : 0
    };
  }, [units, bookings]);

  // --- Courier / Logistics Stats ---
  const courierStats = useMemo(() => {
      const today = new Date();
      const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
      const startOfThisMonth = startOfMonth(today);

      // Filter: Only include bookings with Delivery Details AND that are NOT cancelled
      const deliveryBookings = bookings.filter(b => b.isDelivery && b.deliveryDetails && b.status !== 'Cancelled');

      const dailyRevenue = deliveryBookings
        .filter(b => isSameDay(parseISO(b.startDate), today))
        .reduce((sum, b) => sum + (b.deliveryDetails?.fee || 0), 0);

      const weeklyRevenue = deliveryBookings
        .filter(b => parseISO(b.startDate) >= startOfThisWeek)
        .reduce((sum, b) => sum + (b.deliveryDetails?.fee || 0), 0);

      const monthlyRevenue = deliveryBookings
        .filter(b => parseISO(b.startDate) >= startOfThisMonth)
        .reduce((sum, b) => sum + (b.deliveryDetails?.fee || 0), 0);

      const totalJobs = deliveryBookings.length;
      
      const countAntar = deliveryBookings.filter(b => b.deliveryDetails?.type === 'Antar').length;
      const countJemput = deliveryBookings.filter(b => b.deliveryDetails?.type === 'Jemput').length;

      return { dailyRevenue, weeklyRevenue, monthlyRevenue, totalJobs, deliveryBookings, countAntar, countJemput };
  }, [bookings]);


  // --- Notifications Logic ---
  const notifications = useMemo(() => {
      const today = new Date();
      const tomorrow = addDays(today, 1);
      
      return bookings.filter(b => {
          if (b.status === 'Cancelled') return false;
          
          const startDate = parseISO(b.startDate);
          
          // Check if start date is Today OR Tomorrow
          const isStartingSoon = isSameDay(startDate, today) || isSameDay(startDate, tomorrow);
          
          return isStartingSoon;
      }).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [bookings]);

  // --- Export Data ---
  const handleExport = (type: 'units' | 'bookings' | 'tenants' | 'revenue' | 'logistics' | 'unit-reports') => {
    if (type === 'units') {
      const data = units.map(u => ({
        ID: u.id,
        Name: u.name,
        Category: u.type,
        Status: u.status,
        Price: u.price,
        PromoPrice: u.promoPrice || '-',
        Location: u.address,
        Features: u.features.join(' | ')
      }));
      downloadCSV(data, 'data_unit_gadget');
    } else if (type === 'bookings') {
      const data = bookings.map(b => {
          const tenant = tenants.find(t => t.id === b.tenantId);
          const unitNames = b.unitIds.map(uid => units.find(u => u.id === uid)?.name || uid).join(' | ');
          return {
              ID: b.id,
              Tenant: tenant?.name || b.tenantId,
              Units: unitNames,
              StartDate: b.startDate,
              EndDate: b.endDate,
              Total: b.totalPrice,
              Discount: b.discount || 0,
              Status: b.status,
              Method: b.paymentMethod,
              Delivery: b.isDelivery ? 'Yes' : 'No'
          };
      });
      downloadCSV(data, 'data_transaksi_sewa');
    } else if (type === 'tenants') {
        const data = tenants.map(t => ({
            ID: t.id,
            Name: t.name,
            Phone: t.phone,
            Address: t.address,
            Status: t.status,
            JoinDate: t.joinDate
        }));
        downloadCSV(data, 'data_penyewa');
    } else if (type === 'logistics') {
        const data = courierStats.deliveryBookings.map(b => ({
            BookingID: b.id,
            Date: b.startDate,
            Courier: b.deliveryDetails?.courierName,
            Type: b.deliveryDetails?.type,
            Fee: b.deliveryDetails?.fee,
            Address: b.deliveryDetails?.destinationAddress,
            Status: b.status
        }));
        downloadCSV(data, 'laporan_pendapatan_kurir');
    } else if (type === 'unit-reports') {
        // Mock data logic for export from the render function needs to be replicated or extracted.
        // For simplicity, we just alert. In a real app, move the calculation logic to a shared helper or useMemo.
        alert("Silakan gunakan tombol export di dalam halaman laporan untuk data spesifik bulan ini.");
    }
  };

  // --- Render Views ---

  const renderDashboard = () => {
    // Maintenance List
    const maintenanceUnits = units.filter(u => u.status === UnitStatus.MAINTENANCE);
    const deliveryUnits = units.filter(u => u.status === UnitStatus.DELIVERY || u.status === UnitStatus.PICKUP);
    
    // Revenue Data Generation for Charts (Mock for Dashboard, Detailed is in Revenue View)
    const revenueData = [
        { name: 'Sen', total: 1200000 },
        { name: 'Sel', total: 950000 },
        { name: 'Rab', total: 2100000 },
        { name: 'Kam', total: 800000 },
        { name: 'Jum', total: 1500000 },
        { name: 'Sab', total: 3200000 },
        { name: 'Min', total: 2800000 },
    ];

    const finishMaintenance = (unitId: string) => {
        setUnits(prev => prev.map(u => u.id === unitId ? { ...u, status: UnitStatus.AVAILABLE } : u));
    };

    return (
      <div className="space-y-6 pb-24 lg:pb-0">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
            <p className="text-slate-500">Ringkasan performa bisnis rental gadget Anda.</p>
          </div>
          <button 
             onClick={() => handleExport('revenue')}
             className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-sm font-medium"
          >
             <Download size={16}/> Export Laporan
          </button>
        </header>

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Aset Unit" 
            value={stats.totalUnits} 
            icon={Package} 
            colorClass="bg-white"
          />
          <StatCard 
            title="Sedang Disewa" 
            value={stats.occupiedUnits} 
            icon={Camera} 
            trend={`${stats.occupancyRate}% Utilization`}
            colorClass="bg-blue-50 border-blue-100"
          />
          <StatCard 
            title="Dalam Perbaikan" 
            value={stats.maintenanceUnits} 
            icon={Wrench} 
            colorClass="bg-orange-50 border-orange-100"
          />
          <StatCard 
            title="Logistik (Antar/Jemput)" 
            value={stats.deliveryUnits} 
            icon={Truck} 
            colorClass="bg-violet-50 border-violet-100"
          />
        </div>

        {/* Financial Dashboard Section */}
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Banknote className="text-emerald-600"/> Omset & Keuangan
            </h3>
            
            {/* Financial Stats Grid with Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Daily */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-40">
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Omset Harian (Avg)</p>
                        <h4 className="text-xl font-bold text-emerald-600">Rp 1.5jt</h4>
                    </div>
                    <div className="h-16 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* More Detailed Stats Button */}
                 <button 
                    onClick={() => setCurrentView('revenue')}
                    className="bg-slate-800 text-white p-6 rounded-xl shadow-sm hover:bg-slate-700 transition-colors flex flex-col items-center justify-center gap-3 text-center col-span-1 md:col-span-2 lg:col-span-3"
                 >
                    <BarChart3 className="w-8 h-8 opacity-80" />
                    <div>
                        <h3 className="font-bold text-lg">Lihat Laporan Keuangan Lengkap</h3>
                        <p className="text-sm text-slate-400">Analisis pendapatan Harian, Mingguan, Bulanan & Tahunan</p>
                    </div>
                 </button>
            </div>
        </div>

        {/* Monitoring & Tracking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Maintenance Monitor */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-orange-50/30">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Wrench size={18} className="text-orange-500"/>
                        Unit Under Maintenance
                    </h3>
                    <span className="text-xs font-medium bg-orange-100 text-orange-700 px-2 py-1 rounded-full">{maintenanceUnits.length} Unit</span>
                </div>
                <div className="p-0">
                    {maintenanceUnits.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-slate-200"/>
                            Semua unit dalam kondisi prima.
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="p-3 font-medium">Nama Unit</th>
                                    <th className="p-3 font-medium">Lokasi</th>
                                    <th className="p-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {maintenanceUnits.map(u => (
                                    <tr key={u.id}>
                                        <td className="p-3 font-medium text-slate-700">{u.name}</td>
                                        <td className="p-3 text-slate-500">{u.address}</td>
                                        <td className="p-3 text-right">
                                            <button 
                                                onClick={() => finishMaintenance(u.id)}
                                                className="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded text-xs font-medium border border-green-200"
                                            >
                                                Selesai
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Delivery / Logistics Monitor */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-violet-50/30">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Truck size={18} className="text-violet-500"/>
                        Layanan Antar-Jemput
                    </h3>
                    <div className="flex gap-2">
                         <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-1 rounded-full flex items-center gap-1">
                             <ArrowUpRight size={10}/> {deliveryUnits.filter(u => u.deliveryDetails?.type === 'Antar').length} Antar
                         </span>
                         <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
                             <ArrowDownLeft size={10}/> {deliveryUnits.filter(u => u.deliveryDetails?.type === 'Jemput').length} Jemput
                         </span>
                    </div>
                </div>
                <div className="p-0">
                    {deliveryUnits.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-200"/>
                            Tidak ada pengiriman aktif saat ini.
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="p-3 font-medium">Unit</th>
                                    <th className="p-3 font-medium">Tipe</th>
                                    <th className="p-3 font-medium">Kurir & Waktu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {deliveryUnits.map(u => (
                                    <tr key={u.id}>
                                        <td className="p-3 font-medium text-slate-700">
                                            {u.name}
                                            <div className="text-xs text-slate-400">{u.deliveryDetails?.destinationAddress}</div>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${u.deliveryDetails?.type === 'Antar' ? 'bg-violet-50 text-violet-600 border-violet-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                                {u.deliveryDetails?.type === 'Antar' ? 'PENGANTARAN' : 'PENJEMPUTAN'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-500">
                                            <div className="font-medium text-slate-700">{u.deliveryDetails?.courierName}</div>
                                            <div className="text-xs flex items-center gap-1">
                                                <Clock size={10}/> {u.deliveryDetails?.scheduledTime}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
      </div>
    );
  };

  const renderRevenue = () => {
    // 1. Date Logic
    const startOfSelectedMonth = startOfMonth(currentRevenueDate);
    const endOfSelectedMonth = endOfMonth(currentRevenueDate);
    const selectedYear = getYear(currentRevenueDate);

    // 2. Filter Bookings for the selected Month
    const monthlyBookings = bookings.filter(b => {
        if (b.status === 'Cancelled') return false;
        const bookingDate = parseISO(b.startDate);
        return isSameMonth(bookingDate, currentRevenueDate) && getYear(bookingDate) === selectedYear;
    });

    // 3. Stats Calculation
    const totalMonthlyRevenue = monthlyBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalTransactions = monthlyBookings.length;
    
    // 4. Daily Breakdown (Line Chart Data)
    const daysInMonth = eachDayOfInterval({ start: startOfSelectedMonth, end: endOfSelectedMonth });
    const dailyRevenueData = daysInMonth.map(day => {
        const rev = monthlyBookings
            .filter(b => isSameDay(parseISO(b.startDate), day))
            .reduce((sum, b) => sum + b.totalPrice, 0);
        return {
            date: format(day, 'd'), // 1, 2, 3
            fullDate: format(day, 'dd MMM'),
            revenue: rev
        };
    });

    // 5. Weekly Breakdown (Bar Chart Data)
    const weeklyRevenueData = [1, 2, 3, 4, 5].map(weekNum => {
        // Simple approximation for weeks in month
        // In a real app, use `getWeek` from date-fns more precisely
        const weekRevenue = monthlyBookings
            .filter(b => Math.ceil(parseISO(b.startDate).getDate() / 7) === weekNum)
            .reduce((sum, b) => sum + b.totalPrice, 0);
        
        return { name: `Minggu ${weekNum}`, revenue: weekRevenue };
    }).filter(w => w.revenue > 0 || w.name !== 'Minggu 5'); // Hide week 5 if 0

    // 6. Yearly Context
    const yearlyRevenue = bookings
        .filter(b => b.status !== 'Cancelled' && getYear(parseISO(b.startDate)) === selectedYear)
        .reduce((sum, b) => sum + b.totalPrice, 0);

    // 7. Unit Performance Analysis (Revenue per Unit)
    const unitPerformance: Record<string, { name: string, count: number, revenue: number, type: string }> = {};

    monthlyBookings.forEach(booking => {
        const unitCount = booking.unitIds.length;
        if (unitCount === 0) return;
        
        // Split revenue equally among units in the booking (estimation)
        const revenuePerUnit = booking.totalPrice / unitCount;

        booking.unitIds.forEach(uid => {
            const unit = units.find(u => u.id === uid);
            if (!unit) return;

            if (!unitPerformance[uid]) {
                unitPerformance[uid] = { name: unit.name, count: 0, revenue: 0, type: unit.type };
            }
            unitPerformance[uid].count += 1;
            unitPerformance[uid].revenue += revenuePerUnit;
        });
    });

    const sortedUnitPerformance: { name: string; count: number; revenue: number; type: string }[] = Object.values(unitPerformance).sort((a, b) => b.revenue - a.revenue);
    const top5Units = sortedUnitPerformance.slice(0, 5);

    const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

    return (
        <div className="space-y-6 pb-24 lg:pb-0">
             <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Laporan Pendapatan</h2>
                    <p className="text-slate-500">Analisis detail keuangan sewa unit.</p>
                </div>
                
                {/* Date Filter */}
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <button 
                        onClick={() => setCurrentRevenueDate(subMonths(currentRevenueDate, 1))}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500"
                    >
                        <ChevronLeft size={20}/>
                    </button>
                    <div className="flex items-center gap-2 px-2 min-w-[140px] justify-center font-bold text-slate-700">
                        <Calendar size={16} className="text-primary"/>
                        {format(currentRevenueDate, 'MMMM yyyy')}
                    </div>
                    <button 
                         onClick={() => setCurrentRevenueDate(addMonths(currentRevenueDate, 1))}
                         className="p-1 hover:bg-slate-100 rounded text-slate-500"
                    >
                        <ChevronRight size={20}/>
                    </button>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl flex flex-col justify-between">
                    <div>
                        <p className="text-sm font-medium text-emerald-700 mb-1">Total Pendapatan (Bulan Ini)</p>
                        <h3 className="text-3xl font-bold text-emerald-900">{fmt(totalMonthlyRevenue)}</h3>
                    </div>
                    <div className="mt-4 text-xs text-emerald-600 font-medium bg-emerald-100/50 px-2 py-1 rounded w-fit">
                        {totalTransactions} Transaksi Berhasil
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col justify-between">
                     <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Pendapatan (Tahun {selectedYear})</p>
                        <h3 className="text-2xl font-bold text-slate-800">{fmt(yearlyRevenue)}</h3>
                    </div>
                    <div className="mt-4">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${Math.min(100, (totalMonthlyRevenue / (yearlyRevenue || 1)) * 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 text-right">Kontribusi bulan ini terhadap tahunan</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col justify-center items-center text-center">
                    <p className="text-sm font-medium text-slate-500">Rata-rata per Transaksi</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">
                        {totalTransactions > 0 ? fmt(Math.round(totalMonthlyRevenue / totalTransactions)) : 'Rp 0'}
                    </h3>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Trend Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-500"/>
                        Tren Pendapatan Harian
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyRevenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} interval={2}/>
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(v) => `${v/1000}k`}/>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [fmt(value), 'Pendapatan']}
                                    labelFormatter={(label) => `Tgl ${label}`}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                 {/* Weekly Bar Chart */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <BarChart3 size={18} className="text-purple-500"/>
                        Per Minggu
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyRevenueData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9"/>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} width={70}/>
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [fmt(value), 'Total']}
                                />
                                <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Unit Performance Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top 5 Units Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                     <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Trophy size={18} className="text-yellow-500"/>
                        5 Unit Terlaris
                    </h3>
                    <div className="h-60 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={top5Units} layout="vertical" margin={{ left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9"/>
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 11, fill: '#475569'}} 
                                    width={100}
                                    tickFormatter={(val) => val.length > 15 ? `${val.substring(0, 15)}...` : val}
                                />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [fmt(value), 'Estimasi Pendapatan']}
                                />
                                <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={15} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Detailed Unit Performance Table */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                     <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Performa Aset Unit ({format(currentRevenueDate, 'MMMM')})</h3>
                    </div>
                    <div className="overflow-x-auto max-h-64 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white text-slate-500 border-b border-slate-100 sticky top-0">
                                <tr>
                                    <th className="p-3">Nama Unit</th>
                                    <th className="p-3">Kategori</th>
                                    <th className="p-3 text-center">Freq. Sewa</th>
                                    <th className="p-3 text-right">Total Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {sortedUnitPerformance.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-400">Belum ada data unit tersewa.</td>
                                    </tr>
                                ) : (
                                    sortedUnitPerformance.map((stat, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="p-3 font-medium text-slate-700 flex items-center gap-2">
                                                {idx < 3 && <Trophy size={14} className={idx === 0 ? "text-yellow-500" : idx === 1 ? "text-slate-400" : "text-amber-700"} />}
                                                {stat.name}
                                            </td>
                                            <td className="p-3 text-slate-500 text-xs">{stat.type}</td>
                                            <td className="p-3 text-center text-slate-600 font-medium">{stat.count}x</td>
                                            <td className="p-3 text-right font-bold text-emerald-600">{fmt(stat.revenue)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Monthly Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Rincian Transaksi ({format(currentRevenueDate, 'MMMM')})</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="p-3">Tanggal</th>
                                <th className="p-3">ID Booking</th>
                                <th className="p-3">Penyewa</th>
                                <th className="p-3 text-right">Nominal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {monthlyBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400">Belum ada transaksi di bulan ini.</td>
                                </tr>
                            ) : (
                                monthlyBookings.sort((a,b) => b.startDate.localeCompare(a.startDate)).map(b => {
                                    const tenant = tenants.find(t => t.id === b.tenantId);
                                    return (
                                        <tr key={b.id} className="hover:bg-slate-50">
                                            <td className="p-3 text-slate-600">{b.startDate}</td>
                                            <td className="p-3 font-mono text-xs text-slate-500">{b.id}</td>
                                            <td className="p-3 font-medium text-slate-800">{tenant?.name}</td>
                                            <td className="p-3 text-right font-bold text-emerald-600">{fmt(b.totalPrice)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
  };

  const renderLogistics = () => {
    // Generate simple chart data for logistics
    const today = new Date();
    const chartData = [6, 5, 4, 3, 2, 1, 0].map(daysAgo => {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTotal = courierStats.deliveryBookings
            .filter(b => b.startDate === dateStr)
            .reduce((sum, b) => sum + (b.deliveryDetails?.fee || 0), 0);
            
        return { name: format(date, 'd MMM'), fee: dayTotal };
    });

    // Helper to format currency
    const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

    // Filter Logistics Table
    const filteredLogistics = courierStats.deliveryBookings.filter(b => {
        const term = logisticsSearchTerm.toLowerCase();
        return (
            b.id.toLowerCase().includes(term) ||
            (b.deliveryDetails?.courierName || '').toLowerCase().includes(term) ||
            (b.deliveryDetails?.destinationAddress || '').toLowerCase().includes(term)
        );
    });

    return (
        <div className="space-y-6 pb-24 lg:pb-0">
             <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Laporan Kurir</h2>
                    <p className="text-slate-500">Pendapatan dan performa layanan antar-jemput unit.</p>
                </div>
                <button 
                    onClick={() => handleExport('logistics')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-sm font-medium"
                >
                    <Download size={16}/> Export Laporan
                </button>
            </header>

            {/* Income Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <StatCard 
                    title="Pendapatan Harian" 
                    value={fmt(courierStats.dailyRevenue)} 
                    icon={Wallet} 
                    colorClass="bg-violet-50 border-violet-100"
                />
                 <StatCard 
                    title="Pendapatan Mingguan" 
                    value={fmt(courierStats.weeklyRevenue)} 
                    icon={CalendarRange} 
                    colorClass="bg-white"
                />
                 <StatCard 
                    title="Pendapatan Bulanan" 
                    value={fmt(courierStats.monthlyRevenue)} 
                    icon={Banknote} 
                    colorClass="bg-white"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Tren Pendapatan Ongkir (7 Hari)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                <Tooltip 
                                    formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Pendapatan']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="fee" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Summary Card with Split Stats */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center gap-4">
                   <div className="text-center pb-4 border-b border-slate-100">
                        <h3 className="text-3xl font-bold text-slate-800">{courierStats.totalJobs}</h3>
                        <p className="text-slate-500 font-medium">Total Tugas Kurir</p>
                        <p className="text-xs text-slate-400 mt-1">Sepanjang masa sewa aktif</p>
                   </div>
                   
                   <div className="space-y-3">
                       {/* Antar Stat */}
                       <div className="flex items-center justify-between p-3 rounded-lg bg-violet-50 border border-violet-100">
                           <div className="flex items-center gap-3">
                               <div className="p-2 bg-violet-200 rounded-lg text-violet-700">
                                   <ArrowUpRight size={18}/>
                               </div>
                               <div>
                                   <p className="text-xs text-violet-600 font-bold uppercase tracking-wider">Pengantaran</p>
                                   <p className="text-lg font-bold text-slate-700">{courierStats.countAntar}</p>
                               </div>
                           </div>
                       </div>

                       {/* Jemput Stat */}
                       <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-100">
                           <div className="flex items-center gap-3">
                               <div className="p-2 bg-orange-200 rounded-lg text-orange-700">
                                   <ArrowDownLeft size={18}/>
                               </div>
                               <div>
                                   <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">Penjemputan</p>
                                   <p className="text-lg font-bold text-slate-700">{courierStats.countJemput}</p>
                               </div>
                           </div>
                       </div>
                   </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h3 className="font-bold text-slate-800">Riwayat Tugas Kurir</h3>
                    {/* Search Bar Logistics */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Cari ID, Kurir, Alamat..."
                            value={logisticsSearchTerm}
                            onChange={(e) => setLogisticsSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="p-3">ID Transaksi</th>
                                <th className="p-3">Tanggal</th>
                                <th className="p-3">Kurir</th>
                                <th className="p-3">Tipe</th>
                                <th className="p-3">Alamat</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Biaya (Ongkir)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLogistics.map(b => {
                                // Determine specific status label and color
                                let statusLabel = 'PROSES';
                                let statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
                                
                                if (b.status === 'Completed') {
                                    statusLabel = 'SELESAI';
                                    statusColor = 'bg-green-50 text-green-700 border-green-200';
                                } else if (b.status === 'Cancelled') {
                                    statusLabel = 'DIBATALKAN';
                                    statusColor = 'bg-red-50 text-red-700 border-red-200';
                                } else {
                                    // Active Logic
                                    if (b.deliveryDetails?.type === 'Antar') {
                                        statusLabel = 'DALAM PERJALANAN';
                                        statusColor = 'bg-violet-50 text-violet-700 border-violet-200';
                                    } else {
                                        statusLabel = 'DIJADWALKAN JEMPUT';
                                        statusColor = 'bg-orange-50 text-orange-700 border-orange-200';
                                    }
                                }

                                return (
                                <tr key={b.id} className="hover:bg-slate-50">
                                    <td className="p-3 font-mono text-xs text-slate-500">{b.id}</td>
                                    <td className="p-3 text-slate-600">{b.startDate}</td>
                                    <td className="p-3 font-medium text-slate-800">{b.deliveryDetails?.courierName}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 w-fit ${
                                            b.deliveryDetails?.type === 'Antar' 
                                            ? 'bg-violet-50 text-violet-600 border-violet-100' 
                                            : 'bg-orange-50 text-orange-600 border-orange-100'
                                        }`}>
                                            {b.deliveryDetails?.type === 'Antar' ? <ArrowUpRight size={10}/> : <ArrowDownLeft size={10}/>}
                                            {b.deliveryDetails?.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-3 text-slate-600 truncate max-w-[200px]" title={b.deliveryDetails?.destinationAddress}>{b.deliveryDetails?.destinationAddress}</td>
                                    <td className="p-3">
                                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 w-fit ${statusColor}`}>
                                            {statusLabel === 'DALAM PERJALANAN' && <Truck size={10} />}
                                            {statusLabel === 'DIJADWALKAN JEMPUT' && <Clock size={10} />}
                                            {statusLabel === 'SELESAI' && <Check size={10} />}
                                            {statusLabel}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right font-medium text-violet-700">
                                        {fmt(b.deliveryDetails?.fee || 0)}
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                {filteredLogistics.length === 0 && (
                     <div className="p-8 text-center text-slate-400">
                        Tidak ada data pengiriman yang cocok.
                    </div>
                )}
            </div>
        </div>
    );
  };

  const renderUnitReports = () => {
    // 1. Logic to get unit stats for currentUnitReportDate
    const startOfReportMonth = startOfMonth(currentUnitReportDate);
    const selectedYear = getYear(currentUnitReportDate);

    // Filter Bookings for the selected Month
    const monthlyBookings = bookings.filter(b => {
        if (b.status === 'Cancelled') return false;
        const bookingDate = parseISO(b.startDate);
        return isSameMonth(bookingDate, currentUnitReportDate) && getYear(bookingDate) === selectedYear;
    });

    // Calculate Stats per Unit
    const unitStats = units.map(unit => {
        const unitBookings = monthlyBookings.filter(b => b.unitIds.includes(unit.id));
        
        const frequency = unitBookings.length;
        
        // Estimate Revenue
        const revenue = unitBookings.reduce((sum, b) => {
            // Split revenue by number of units in that booking
            return sum + (b.totalPrice / b.unitIds.length);
        }, 0);

        // Estimate Duration (Days)
        const duration = unitBookings.reduce((days, b) => {
            const start = new Date(b.startDate);
            const end = new Date(b.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
            return days + diffDays;
        }, 0);

        return {
            ...unit,
            frequency,
            revenue,
            duration
        };
    }).sort((a, b) => b.revenue - a.revenue);

    const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

    return (
        <div className="space-y-6 pb-24 lg:pb-0">
             <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Laporan Sewa Unit</h2>
                    <p className="text-slate-500">Analisis performa dan produktivitas setiap unit.</p>
                </div>
                
                 {/* Date Filter (Month Selector) */}
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <button 
                        onClick={() => setCurrentUnitReportDate(subMonths(currentUnitReportDate, 1))}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500"
                    >
                        <ChevronLeft size={20}/>
                    </button>
                    <div className="flex items-center gap-2 px-2 min-w-[140px] justify-center font-bold text-slate-700">
                        <Calendar size={16} className="text-primary"/>
                        {format(currentUnitReportDate, 'MMMM yyyy')}
                    </div>
                    <button 
                         onClick={() => setCurrentUnitReportDate(addMonths(currentUnitReportDate, 1))}
                         className="p-1 hover:bg-slate-100 rounded text-slate-500"
                    >
                        <ChevronRight size={20}/>
                    </button>
                </div>
            </header>
            
            <div className="flex items-center gap-2 mb-4">
                 <button 
                    onClick={() => handleExport('unit-reports')}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium shadow-sm"
                >
                    <Download size={16}/> Download Data Unit
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="p-4">Nama Unit</th>
                                <th className="p-4">Kategori</th>
                                <th className="p-4 text-center">Freq. Sewa</th>
                                <th className="p-4 text-center">Durasi Total</th>
                                <th className="p-4 text-right">Pendapatan (Est)</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {unitStats.map((unit, idx) => (
                                <tr key={unit.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-700 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            {unit.name}
                                            {unit.frequency === 0 && <span className="block text-[10px] text-red-400 font-normal">Tidak ada sewa bulan ini</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-500">
                                        <span className="bg-slate-100 px-2 py-1 rounded text-xs">{unit.type}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="font-bold text-slate-700">{unit.frequency}x</span>
                                    </td>
                                    <td className="p-4 text-center text-slate-600">
                                        {unit.duration} Hari
                                    </td>
                                    <td className="p-4 text-right font-bold text-emerald-600">
                                        {fmt(unit.revenue)}
                                    </td>
                                    <td className="p-4 text-center">
                                         <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                             unit.status === UnitStatus.AVAILABLE ? 'bg-green-100 text-green-700' : 
                                             unit.status === UnitStatus.OCCUPIED ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                         }`}>
                                            {unit.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
  };

  const renderUnits = () => {
    const filteredUnits = units.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(unitSearchTerm.toLowerCase()) || 
                              u.id.toLowerCase().includes(unitSearchTerm.toLowerCase());
        const matchesStatus = unitStatusFilter === 'ALL' || u.status === unitStatusFilter;
        const matchesCategory = unitCategoryFilter === 'ALL' || u.type === unitCategoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    return (
        <div className="space-y-6 pb-24 lg:pb-0">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Aset Unit Gadget</h2>
                    <p className="text-slate-500">Kelola inventaris kamera dan iPhone.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleExport('units')}
                        className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                        title="Export CSV"
                    >
                        <Download size={20}/>
                    </button>
                    <button 
                        onClick={() => {
                            setEditingUnit(undefined);
                            setIsUnitModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        <Plus size={18}/> Tambah Unit
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Cari Unit..." 
                        value={unitSearchTerm}
                        onChange={(e) => setUnitSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                <select 
                    value={unitCategoryFilter}
                    onChange={(e) => setUnitCategoryFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-50 rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="ALL">Semua Kategori</option>
                    {Object.values(UnitType).map((t) => <option key={t as string} value={t as string}>{t as string}</option>)}
                </select>
                <select 
                    value={unitStatusFilter}
                    onChange={(e) => setUnitStatusFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-50 rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="ALL">Semua Status</option>
                    {Object.values(UnitStatus).map((s) => <option key={s as string} value={s as string}>{s as string}</option>)}
                </select>
            </div>

            {/* Units Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredUnits.map(unit => {
                    const isOccupied = unit.status === UnitStatus.OCCUPIED || unit.status === UnitStatus.DELIVERY || unit.status === UnitStatus.PICKUP;
                    const statusColors = {
                        [UnitStatus.AVAILABLE]: 'bg-green-100 text-green-700',
                        [UnitStatus.OCCUPIED]: 'bg-blue-100 text-blue-700',
                        [UnitStatus.MAINTENANCE]: 'bg-orange-100 text-orange-700',
                        [UnitStatus.DELIVERY]: 'bg-violet-100 text-violet-700',
                        [UnitStatus.PICKUP]: 'bg-amber-100 text-amber-700',
                    };

                    return (
                        <div key={unit.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:border-blue-200 transition-colors group">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${statusColors[unit.status]}`}>
                                    {unit.status}
                                </span>
                                <div className="relative">
                                    <button className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 group-hover:block lg:hidden">
                                        <MoreVertical size={16}/>
                                    </button>
                                    {/* Quick Actions (visible on hover for desktop) */}
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => {
                                                setEditingUnit(unit);
                                                setIsUnitModalOpen(true);
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                            title="Edit"
                                        >
                                            <Edit size={16}/>
                                        </button>
                                        <button 
                                            onClick={() => confirmDeleteUnit(unit.id, unit.name)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-slate-800 line-clamp-1" title={unit.name}>{unit.name}</h3>
                            <p className="text-xs text-slate-500 mb-3">{unit.type}</p>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-xs text-slate-600">
                                    <span className="flex items-center gap-1"><Tag size={12}/> Harga Sewa</span>
                                    <span className="font-semibold text-slate-800">Rp {unit.price.toLocaleString()}/hr</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-600">
                                    <span className="flex items-center gap-1"><MapPin size={12}/> Lokasi</span>
                                    <span className="truncate max-w-[120px]" title={unit.address}>{unit.address}</span>
                                </div>
                            </div>

                            {/* Detailed Delivery/Pickup Info Card (Show if status is DELIVERY or PICKUP) */}
                            {(unit.status === UnitStatus.DELIVERY || unit.status === UnitStatus.PICKUP) && unit.deliveryDetails && (
                                <div className={`mb-3 p-2.5 rounded-lg border text-xs space-y-1.5 ${unit.status === UnitStatus.DELIVERY ? 'bg-violet-50 border-violet-100' : 'bg-orange-50 border-orange-100'}`}>
                                    <div className={`font-bold flex items-center gap-1 ${unit.status === UnitStatus.DELIVERY ? 'text-violet-700' : 'text-orange-700'}`}>
                                        {unit.status === UnitStatus.DELIVERY ? <Truck size={12}/> : <Clock size={12}/>}
                                        {unit.status === UnitStatus.DELIVERY ? 'Sedang Diantar' : 'Menunggu Jemput'}
                                    </div>
                                    <div className="flex items-start gap-1.5 text-slate-600">
                                        <Package size={12} className="mt-0.5 shrink-0"/>
                                        <span className="font-medium">{unit.deliveryDetails.courierName}</span>
                                    </div>
                                    <div className="flex items-start gap-1.5 text-slate-600">
                                        <MapPin size={12} className="mt-0.5 shrink-0"/>
                                        <span className="truncate leading-tight">{unit.deliveryDetails.destinationAddress}</span>
                                    </div>
                                    <div className="flex items-start gap-1.5 text-slate-600">
                                        <Clock size={12} className="mt-0.5 shrink-0"/>
                                        <span>{unit.deliveryDetails.scheduledTime}</span>
                                    </div>
                                </div>
                            )}

                            {isOccupied && unit.tenantId && (
                                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs flex items-center gap-2 mb-2">
                                    <Users size={12} className="text-blue-500"/>
                                    <span className="truncate text-slate-600">
                                        Disewa: <span className="font-medium text-slate-800">{tenants.find(t => t.id === unit.tenantId)?.name || 'Unknown'}</span>
                                    </span>
                                </div>
                            )}

                            {unit.promoPrice && unit.promoPrice > 0 && (
                                <div className="text-[10px] text-red-600 font-medium bg-red-50 px-2 py-1 rounded flex items-center gap-1 w-fit">
                                    <Sparkles size={10}/> Promo Aktif
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {filteredUnits.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                    Tidak ada unit yang cocok dengan filter.
                </div>
            )}
        </div>
    );
  };

  const renderTenants = () => {
      // Logic to count bookings and calculate total spent per tenant
      const getTenantStats = (tenantId: string) => {
          const tenantBookings = bookings.filter(b => b.tenantId === tenantId && b.status !== 'Cancelled');
          return {
              count: tenantBookings.length,
              spent: tenantBookings.reduce((sum, b) => sum + b.totalPrice, 0)
          };
      };

      const filtered = tenants
          .map(t => {
              const stats = getTenantStats(t.id);
              return { ...t, rentalCount: stats.count, totalSpent: stats.spent };
          })
          .filter(t => 
              t.name.toLowerCase().includes(tenantSearchTerm.toLowerCase()) || 
              t.phone.includes(tenantSearchTerm)
          )
          .sort((a, b) => b.rentalCount - a.rentalCount); // Sort by rental count Descending

      return (
          <div className="space-y-6 pb-24 lg:pb-0">
             <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Data Pelanggan (Penyewa)</h2>
                    <p className="text-slate-500">Database customer dan riwayat penyewaan.</p>
                </div>
                <div className="flex items-center gap-2">
                     <button 
                        onClick={() => handleExport('tenants')}
                        className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                        title="Export CSV"
                    >
                        <Download size={20}/>
                    </button>
                    <button 
                        onClick={() => {
                            setEditingTenant(undefined);
                            setIsTenantModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        <Plus size={18}/> Pelanggan Baru
                    </button>
                </div>
            </header>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                 <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Cari Nama / No. HP..." 
                        value={tenantSearchTerm}
                        onChange={(e) => setTenantSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(tenant => {
                    const statusColor = tenant.status === 'Active' ? 'text-green-600 bg-green-50' 
                                      : tenant.status === 'Blacklist' ? 'text-red-600 bg-red-50' 
                                      : 'text-slate-500 bg-slate-100';
                    
                    return (
                        <div key={tenant.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-blue-200 transition-colors relative overflow-hidden">
                            {/* Rental Count Badge */}
                            <div className="absolute top-0 right-0 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-bl-xl border-l border-b border-blue-100 flex items-center gap-1.5 shadow-sm">
                                <ShoppingBag size={14} className="fill-blue-200"/>
                                <span className="font-bold text-sm">{tenant.rentalCount}x</span>
                                <span className="text-[10px] font-medium opacity-80 uppercase">Sewa</span>
                            </div>

                            <div>
                                <div className="flex justify-between items-start mb-2 mt-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">
                                        {tenant.name.charAt(0)}
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setEditingTenant(tenant);
                                            setIsTenantModalOpen(true);
                                        }}
                                        className="text-slate-300 hover:text-blue-600 transition-colors p-1"
                                    >
                                        <Edit size={18} />
                                    </button>
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg">{tenant.name}</h3>
                                <p className="text-xs text-slate-400 mb-4">Member sejak {tenant.joinDate}</p>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Phone size={14} /> {tenant.phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Mail size={14} /> {tenant.email || '-'}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <MapPin size={14} /> <span className="truncate">{tenant.address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div className="p-1.5 bg-emerald-50 rounded-full text-emerald-600">
                                        <Banknote size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase">Total Nominal</p>
                                        <p className="text-sm font-bold text-emerald-600">Rp {tenant.totalSpent.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                                <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${statusColor}`}>
                                    {tenant.status}
                                </span>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setSelectedTenantHistory(tenant.id)}
                                        className="text-xs font-medium text-slate-500 hover:text-primary flex items-center gap-1"
                                    >
                                        <History size={12}/> Riwayat
                                    </button>
                                    <span className="text-xs text-slate-400 font-mono">{tenant.id}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tenant History Modal */}
            {selectedTenantHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                         <div className="flex justify-between items-center p-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800">Riwayat Sewa: {tenants.find(t => t.id === selectedTenantHistory)?.name}</h3>
                            <button onClick={() => setSelectedTenantHistory(null)}><X size={20} className="text-slate-400"/></button>
                         </div>
                         <div className="p-4 overflow-y-auto flex-1">
                             {bookings.filter(b => b.tenantId === selectedTenantHistory).length === 0 ? (
                                 <p className="text-center text-slate-400 py-8">Belum ada riwayat transaksi.</p>
                             ) : (
                                 <div className="space-y-3">
                                     <div className="grid grid-cols-2 gap-3 mb-4">
                                         <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                                             <p className="text-xs text-blue-600 font-medium">Total Transaksi</p>
                                             <p className="text-xl font-bold text-blue-800">{bookings.filter(b => b.tenantId === selectedTenantHistory).length}</p>
                                         </div>
                                         <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
                                             <p className="text-xs text-emerald-600 font-medium">Total Belanja</p>
                                             <p className="text-xl font-bold text-emerald-800">
                                                 Rp {bookings.filter(b => b.tenantId === selectedTenantHistory && b.status !== 'Cancelled').reduce((sum, b) => sum + b.totalPrice, 0).toLocaleString()}
                                             </p>
                                         </div>
                                     </div>
                                     {bookings.filter(b => b.tenantId === selectedTenantHistory).sort((a,b) => b.startDate.localeCompare(a.startDate)).map(b => (
                                         <div key={b.id} className="border border-slate-100 rounded-lg p-3 hover:bg-slate-50">
                                             <div className="flex justify-between mb-1">
                                                 <span className="font-mono text-xs text-slate-500">{b.id}</span>
                                                 <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${b.status === 'Completed' ? 'bg-green-100 text-green-700' : b.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{b.status}</span>
                                             </div>
                                             <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                                                 <Calendar size={12}/> {b.startDate} s/d {b.endDate}
                                             </div>
                                             <div className="text-sm font-medium text-slate-800 mb-1">
                                                 {b.unitIds.map(uid => units.find(u => u.id === uid)?.name).join(', ')}
                                             </div>
                                             <div className="text-right text-sm font-bold text-primary">
                                                 Rp {b.totalPrice.toLocaleString()}
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                         </div>
                    </div>
                </div>
            )}
          </div>
      );
  };

  const renderBookings = () => {
    // Combine filters
    const filteredBookings = bookings.filter(b => {
        const matchesStatus = bookingStatusFilter === 'ALL' || b.status === bookingStatusFilter;
        // Search by ID or Tenant Name
        const tenantName = tenants.find(t => t.id === b.tenantId)?.name.toLowerCase() || '';
        const matchesSearch = b.id.toLowerCase().includes(bookingSearchTerm.toLowerCase()) || tenantName.includes(bookingSearchTerm.toLowerCase());
        
        return matchesStatus && matchesSearch;
    }).sort((a,b) => b.startDate.localeCompare(a.startDate)); // Newest first

    return (
        <div className="space-y-6 pb-24 lg:pb-0">
             <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Transaksi Sewa</h2>
                    <p className="text-slate-500">Kelola booking, pembayaran, dan jadwal.</p>
                </div>
                <div className="flex items-center gap-2">
                     <button 
                        onClick={() => handleExport('bookings')}
                        className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                        title="Export CSV"
                    >
                        <Download size={20}/>
                    </button>
                    <button 
                        onClick={() => {
                            setEditingBooking(undefined);
                            setIsBookingModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        <Plus size={18}/> Booking Baru
                    </button>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Cari ID Booking / Nama Penyewa..." 
                        value={bookingSearchTerm}
                        onChange={(e) => setBookingSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {['ALL', 'Active', 'Completed', 'Cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setBookingStatusFilter(status as any)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                                bookingStatusFilter === status ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {status === 'ALL' ? 'Semua' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="p-4">ID & Tanggal</th>
                                <th className="p-4">Penyewa</th>
                                <th className="p-4">Unit Sewa</th>
                                <th className="p-4">Status & Pembayaran</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBookings.map(booking => {
                                const tenant = tenants.find(t => t.id === booking.tenantId);
                                const statusColors = {
                                    'Active': 'bg-blue-100 text-blue-700',
                                    'Completed': 'bg-green-100 text-green-700',
                                    'Cancelled': 'bg-red-100 text-red-700',
                                };

                                return (
                                    <tr key={booking.id} className="hover:bg-slate-50 group">
                                        <td className="p-4 align-top">
                                            <div className="font-mono font-bold text-slate-700">{booking.id}</div>
                                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                <Calendar size={12}/>
                                                {booking.startDate} <span className="text-slate-300">→</span> {booking.endDate}
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="font-medium text-slate-800">{tenant?.name}</div>
                                            <div className="text-xs text-slate-500">{tenant?.phone}</div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="space-y-1">
                                                {booking.unitIds.map(uid => {
                                                    const unit = units.find(u => u.id === uid);
                                                    return (
                                                        <div key={uid} className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs w-fit">
                                                            <Package size={10}/> {unit?.name || uid}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            {booking.isDelivery && (
                                                <div className="mt-2 text-[10px] text-violet-600 flex items-center gap-1 font-medium">
                                                    <Truck size={10}/> Pengiriman Aktif
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="flex flex-col gap-2">
                                                <span className={`w-fit px-2 py-1 rounded text-[10px] font-bold uppercase ${statusColors[booking.status]}`}>
                                                    {booking.status}
                                                </span>
                                                <div className="text-xs">
                                                    <div className="text-slate-500">Total: <span className="font-bold text-slate-800">Rp {booking.totalPrice.toLocaleString()}</span></div>
                                                    {booking.remainingBalance > 0 ? (
                                                        <div className="text-red-600 font-medium">Kurang: Rp {booking.remainingBalance.toLocaleString()}</div>
                                                    ) : (
                                                        <div className="text-emerald-600 font-medium flex items-center gap-1"><Check size={10}/> Lunas</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => {
                                                        setEditingBooking(booking);
                                                        setIsBookingModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit / Detail"
                                                >
                                                    <Edit size={16}/>
                                                </button>
                                                <button 
                                                    onClick={() => confirmDeleteBooking(booking.id, tenant?.name || 'Unknown')}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredBookings.length === 0 && (
                     <div className="p-12 text-center text-slate-400">
                        Tidak ada transaksi yang cocok.
                    </div>
                )}
            </div>
        </div>
    );
  };

  const navItems: { id: string; icon: LucideIcon; label: string }[] = [
    {id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard'},
    {id: 'bookings', icon: ReceiptText, label: 'Transaksi Sewa'},
    {id: 'units', icon: Camera, label: 'Aset Unit'},
    {id: 'unit-reports', icon: ClipboardList, label: 'Laporan Unit'},
    {id: 'tenants', icon: Users, label: 'Data Penyewa'},
    {id: 'calendar', icon: Calendar, label: 'Kalendar'},
    {id: 'revenue', icon: BarChart3, label: 'Laporan Keuangan'},
    {id: 'logistics', icon: Truck, label: 'Logistik'},
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 lg:pb-0 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
             <Aperture className="text-primary w-6 h-6" />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-800">CAMPRO<span className="text-primary">RENT</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
              const Icon = item.icon;
              return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    currentView === item.id 
                    ? 'bg-blue-50 text-primary shadow-sm ring-1 ring-blue-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                  <Icon size={18} className={currentView === item.id ? 'stroke-[2.5px]' : ''}/>
                  {item.label}
              </button>
          )})}
        </nav>

        <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-900 rounded-xl p-4 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-xs text-slate-400 mb-1">Status Langganan</p>
                    <p className="font-bold text-sm">Pro Plan</p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10">
                    <Zap size={60} />
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
          {/* Mobile Header */}
          <header className="lg:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-30 flex items-center justify-between">
             <div className="flex items-center gap-2">
                 <div className="bg-primary/10 p-1.5 rounded-lg">
                    <Aperture className="text-primary w-5 h-5" />
                 </div>
                 <h1 className="font-bold text-lg text-slate-800">CAMPRORENT</h1>
             </div>
             <button className="relative p-2 text-slate-500">
                 <Bell size={20} />
                 {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>}
             </button>
          </header>

          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
             {currentView === 'dashboard' && renderDashboard()}
             {currentView === 'revenue' && renderRevenue()}
             {currentView === 'logistics' && renderLogistics()}
             {currentView === 'units' && renderUnits()}
             {currentView === 'unit-reports' && renderUnitReports()}
             {currentView === 'tenants' && renderTenants()}
             {currentView === 'bookings' && renderBookings()}
             {currentView === 'calendar' && <CalendarView bookings={bookings} units={units} tenants={tenants} />}
          </div>
      </main>

      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />

      {/* Modals */}
      <UnitModal 
         isOpen={isUnitModalOpen} 
         onClose={() => setIsUnitModalOpen(false)}
         onSave={handleSaveUnit}
         initialData={editingUnit}
      />
      
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSave={handleSaveBooking}
        units={units}
        tenants={tenants}
        initialData={editingBooking}
      />

      <TenantModal
        isOpen={isTenantModalOpen}
        onClose={() => setIsTenantModalOpen(false)}
        onSave={handleSaveTenant}
        initialData={editingTenant}
      />

      {/* Delete Confirmation Modal (Simple) */}
      {deleteTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 mx-auto">
                      <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Hapus Unit?</h3>
                  <p className="text-slate-500 text-center text-sm mb-6">
                      Apakah Anda yakin ingin menghapus <strong>{deleteTarget.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <div className="flex gap-3">
                      <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Batal</button>
                      <button onClick={handleDeleteUnit} className="flex-1 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg shadow-sm shadow-red-200">Hapus</button>
                  </div>
              </div>
          </div>
      )}

      {deleteBookingTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
                   <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 mx-auto">
                      <Trash2 size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Hapus Transaksi?</h3>
                  <p className="text-slate-500 text-center text-sm mb-6">
                      Hapus data sewa <strong>{deleteBookingTarget.id}</strong> ({deleteBookingTarget.tenantName})? Unit terkait akan dikembalikan ke status 'Available'.
                  </p>
                  <div className="flex gap-3">
                      <button onClick={() => setDeleteBookingTarget(null)} className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Batal</button>
                      <button onClick={handleDeleteBooking} className="flex-1 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg shadow-sm shadow-red-200">Hapus</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default App;