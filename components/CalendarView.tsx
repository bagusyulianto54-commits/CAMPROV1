import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isWithinInterval,
  parseISO,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Package, User } from 'lucide-react';
import { Booking, Unit, Tenant } from '../types';

interface CalendarViewProps {
  bookings: Booking[];
  units: Unit[];
  tenants: Tenant[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ bookings, units, tenants }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayBookings = (day: Date) => {
    return bookings.filter(booking => {
      const start = parseISO(booking.startDate);
      const end = parseISO(booking.endDate);
      return isWithinInterval(day, { start, end });
    });
  };

  const weekDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-140px)]">
      {/* Calendar Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex bg-white rounded-lg border border-slate-200 p-0.5 shadow-sm">
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600">
              <ChevronLeft size={18} />
            </button>
            <button onClick={goToToday} className="px-3 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md border-x border-transparent hover:border-slate-200">
              Hari Ini
            </button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        
        {/* Legend */}
        <div className="hidden md:flex gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Sedang Sewa
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span> Delivery
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Selesai
          </div>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
        {calendarDays.map((day, dayIdx) => {
          const dayBookings = getDayBookings(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);

          return (
            <div 
              key={day.toString()} 
              className={`min-h-[100px] border-b border-r border-slate-100 p-1 relative group transition-colors hover:bg-slate-50 ${
                !isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'bg-white'
              }`}
            >
              <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                isTodayDate ? 'bg-primary text-white shadow-sm' : 'text-slate-600'
              }`}>
                {format(day, 'd')}
              </div>

              <div className="space-y-1">
                {dayBookings.map(booking => {
                  const tenant = tenants.find(t => t.id === booking.tenantId);
                  
                  // Color logic
                  let bgClass = 'bg-blue-100 text-blue-700 border-blue-200';
                  if (booking.status === 'Completed') bgClass = 'bg-green-100 text-green-700 border-green-200';
                  else if (booking.isDelivery) bgClass = 'bg-violet-100 text-violet-700 border-violet-200';
                  else if (booking.status === 'Cancelled') bgClass = 'bg-red-100 text-red-700 border-red-200 opacity-60';

                  return (
                    <div 
                      key={booking.id}
                      className={`text-[10px] px-1.5 py-1 rounded border shadow-sm truncate cursor-pointer transition-transform hover:scale-[1.02] ${bgClass}`}
                      title={`${tenant?.name || 'Penyewa'} - ${booking.status}`}
                    >
                      {/* Only show name on start date or if it's the first day of the week displayed for continuity */}
                      <div className="flex items-center gap-1">
                          {booking.isDelivery && <span className="font-bold">🚚</span>}
                          <span className="font-semibold">{tenant?.name.split(' ')[0]}</span>
                      </div>
                      <div className="text-[9px] opacity-80 flex gap-1 overflow-hidden">
                        {booking.unitIds.length} Unit
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;