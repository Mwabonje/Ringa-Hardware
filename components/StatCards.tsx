import React from 'react';
import { DollarSign, AlertTriangle, Truck, ShoppingBag, TrendingUp, PieChart } from 'lucide-react';
import { InventoryItem, DailyStats, LPO } from '../types';

interface StatCardsProps {
  inventory: InventoryItem[];
  stats: DailyStats;
  lpos: LPO[];
}

const StatCards: React.FC<StatCardsProps> = ({ inventory, stats, lpos }) => {
  // Use buyingPrice for Inventory Valuation (Cost Basis)
  const totalValue = inventory.reduce((acc, item) => acc + (item.stockLevel * item.buyingPrice), 0);
  const lowStockCount = inventory.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock').length;
  
  // Pending Deliveries (Pending or Approved LPOs)
  const pendingDeliveries = lpos.filter(lpo => lpo.status === 'Pending' || lpo.status === 'Approved');
  const pendingCount = pendingDeliveries.length;
  
  // Calculate Next Arrival
  let nextArrivalText = 'CHECK DATES';
  if (pendingCount > 0) {
      const withDates = pendingDeliveries.filter(l => l.expectedDate);
      if (withDates.length > 0) {
          withDates.sort((a, b) => new Date(a.expectedDate!).getTime() - new Date(b.expectedDate!).getTime());
          const nextDateStr = withDates[0].expectedDate;
          if (nextDateStr) {
              const date = new Date(nextDateStr);
              if (!isNaN(date.getTime())) {
                  nextArrivalText = `NEXT ARRIVAL: ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
              }
          }
      } else {
        nextArrivalText = 'NO DATES SET';
      }
  }

  // Format currency to Kenyan Shillings
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
      {/* Total Inventory Value */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Inventory Value</p>
          <div className="text-primary bg-primary/10 p-1.5 rounded-lg">
             <DollarSign size={20} />
          </div>
        </div>
        <p className="text-2xl font-bold dark:text-white truncate" title={formatCurrency(totalValue)}>
          {formatCurrency(totalValue)}
        </p>
        <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold mt-auto">
          <TrendingUp size={12} />
          BASED ON COST PRICE
        </div>
      </div>

      {/* Today's Sales */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Today's Revenue</p>
          <div className="text-purple-500 bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-lg">
             <ShoppingBag size={20} />
          </div>
        </div>
        <p className="text-2xl font-bold dark:text-white truncate" title={formatCurrency(stats.revenue)}>
            {formatCurrency(stats.revenue)}
        </p>
        <div className="flex items-center gap-1 text-[10px] text-purple-500 font-bold uppercase mt-auto">
          {stats.transactionCount} TRANSACTIONS
        </div>
      </div>

      {/* Today's Profit */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Today's Profit</p>
          <div className="text-teal-500 bg-teal-100 dark:bg-teal-900/30 p-1.5 rounded-lg">
             <PieChart size={20} />
          </div>
        </div>
        <p className="text-2xl font-bold dark:text-white truncate" title={formatCurrency(stats.profit)}>
            {formatCurrency(stats.profit)}
        </p>
        <div className="flex items-center gap-1 text-[10px] text-teal-500 font-bold uppercase mt-auto">
          NET INCOME (EST)
        </div>
      </div>

      {/* Pending Deliveries - Conditional */}
      {pendingCount > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Deliveries</p>
            <div className="text-blue-500 bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg">
                <Truck size={20} />
            </div>
            </div>
            <p className="text-2xl font-bold dark:text-white">
                {pendingCount.toString().padStart(2, '0')} Order{pendingCount !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-blue-500 font-bold uppercase mt-auto">
            {nextArrivalText}
            </div>
        </div>
      )}

      {/* Low Stock Items */}
      <div className={`bg-white dark:bg-slate-900 p-6 rounded-xl border flex flex-col gap-2 shadow-sm ring-1 relative overflow-hidden transition-all ${lowStockCount > 0 ? 'border-safety-orange/30 ring-safety-orange/10' : 'border-slate-200 dark:border-slate-800 ring-transparent'}`}>
        <div className="absolute top-0 right-0 p-6 opacity-5">
           <AlertTriangle size={64} />
        </div>
        <div className="flex justify-between items-start relative z-10">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Low Stock Items</p>
          <div className={lowStockCount > 0 ? "text-safety-orange bg-safety-orange/10 p-1.5 rounded-lg" : "text-slate-400 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg"}>
            <AlertTriangle size={20} />
          </div>
        </div>
        <p className="text-2xl font-bold dark:text-white relative z-10">{lowStockCount} Items</p>
        <div className={`flex items-center gap-1 text-[10px] font-bold uppercase mt-auto relative z-10 ${lowStockCount > 0 ? 'text-safety-orange' : 'text-emerald-500'}`}>
          {lowStockCount > 0 ? 'RESTOCK REQUIRED' : 'ALL STOCKED UP'}
        </div>
      </div>
    </div>
  );
};

export default StatCards;