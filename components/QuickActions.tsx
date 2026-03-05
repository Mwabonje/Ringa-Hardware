import React from 'react';
import { Zap, Truck, RotateCcw, ShoppingCart, ChevronRight, ClipboardList } from 'lucide-react';
import { Role } from '../types';

interface QuickActionsProps {
  onAction: (type: 'DELIVERY' | 'SALE' | 'RETURN' | 'LPO') => void;
  userRole?: Role;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction, userRole }) => {
  const isCashier = userRole === 'CASHIER';

  return (
    <section>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
        <Zap size={24} className="text-amber-400" fill="currentColor" />
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 gap-3">
        <button 
          onClick={() => onAction('SALE')}
          className="flex items-center gap-4 p-4 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 group text-left"
        >
          <div className="size-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShoppingCart size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold">New Sale</p>
            <p className="text-xs text-blue-100">Record customer transaction</p>
          </div>
          <ChevronRight className="ml-auto text-blue-200" size={20} />
        </button>

        {!isCashier && (
        <button 
          onClick={() => onAction('LPO')}
          className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500/50 transition-all group shadow-sm text-left"
        >
          <div className="size-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ClipboardList size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold dark:text-slate-200">Create LPO</p>
            <p className="text-xs text-slate-500">Order stock from suppliers</p>
          </div>
          <ChevronRight className="ml-auto text-slate-400" size={20} />
        </button>
        )}

        {!isCashier && (
        <button 
          onClick={() => onAction('DELIVERY')}
          className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500/50 transition-all group shadow-sm text-left"
        >
          <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Truck size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold dark:text-slate-200">Log Delivery</p>
            <p className="text-xs text-slate-500">Restock inventory items</p>
          </div>
          <ChevronRight className="ml-auto text-slate-400" size={20} />
        </button>
        )}

        <button 
          onClick={() => onAction('RETURN')}
          className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-safety-orange dark:hover:border-safety-orange/50 transition-all group shadow-sm text-left"
        >
          <div className="size-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <RotateCcw size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold dark:text-slate-200">Customer Return</p>
            <p className="text-xs text-slate-500">Refund or exchange items</p>
          </div>
          <ChevronRight className="ml-auto text-slate-400" size={20} />
        </button>
      </div>
    </section>
  );
};

export default QuickActions;