
import React from 'react';
import { LayoutDashboard, Package, Users, ReceiptText, Calendar, Truck, BarChart3, ClipboardList } from 'lucide-react';

interface BottomNavProps {
  currentView: 'dashboard' | 'units' | 'tenants' | 'bookings' | 'calendar' | 'logistics' | 'revenue' | 'unit-reports';
  setCurrentView: (view: 'dashboard' | 'units' | 'tenants' | 'bookings' | 'calendar' | 'logistics' | 'revenue' | 'unit-reports') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'bookings', label: 'Sewa', icon: ReceiptText },
    { id: 'calendar', label: 'Jadwal', icon: Calendar },
    { id: 'revenue', label: 'Keuangan', icon: BarChart3 },
    { id: 'logistics', label: 'Logistik', icon: Truck },
    // { id: 'units', label: 'Unit', icon: Package },
    // { id: 'tenants', label: 'Penyewa', icon: Users }, // Removed to fit 5 items, users can use dashboard/menu or prioritize
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-slate-200 lg:hidden pb-safe">
      <div className="flex justify-around items-center px-2 py-3">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              className={`flex flex-col items-center justify-center w-full space-y-1 transition-all duration-200 ${
                isActive ? 'text-primary transform scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${isActive ? 'bg-blue-50' : 'bg-transparent'}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'fill-blue-500/20 stroke-primary' : 'stroke-current'}`} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
