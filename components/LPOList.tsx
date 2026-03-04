import React from 'react';
import { ClipboardList, Calendar, Building2, ChevronRight, CheckCircle2, Clock, XCircle, Printer, Eye } from 'lucide-react';
import { LPO } from '../types';

interface LPOListProps {
  lpos: LPO[];
  onStatusChange: (id: string, newStatus: LPO['status']) => void;
  onPrint: (lpo: LPO) => void;
}

const LPOList: React.FC<LPOListProps> = ({ lpos, onStatusChange, onPrint }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'Approved': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'Received': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'Cancelled': return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock size={12} />;
      case 'Approved': return <CheckCircle2 size={12} />;
      case 'Received': return <CheckCircle2 size={12} />;
      case 'Cancelled': return <XCircle size={12} />;
      default: return null;
    }
  };

  const formatKsh = (amount: number) => `Ksh ${amount.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold dark:text-white flex items-center gap-2">
        <ClipboardList size={24} className="text-slate-400" />
        Purchase Orders (LPO)
      </h2>

      <div className="grid gap-4">
        {lpos.length > 0 ? (
          lpos.map((lpo) => (
            <div 
              key={lpo.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                
                {/* Header Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      #{lpo.lpoNumber}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border flex items-center gap-1 uppercase tracking-wide ${getStatusColor(lpo.status)}`}>
                      {getStatusIcon(lpo.status)} {lpo.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 size={18} className="text-slate-400" />
                    {lpo.supplierName}
                  </h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                     <span className="flex items-center gap-1">
                        <Calendar size={14} /> Issued: {lpo.dateIssued}
                     </span>
                     {lpo.expectedDate && (
                       <span className="flex items-center gap-1 text-slate-400">
                          Expected: {lpo.expectedDate}
                       </span>
                     )}
                  </div>
                </div>

                {/* Items Summary */}
                <div className="flex-1 lg:border-l lg:border-r border-slate-100 dark:border-slate-800 lg:px-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Order Summary</p>
                    <ul className="space-y-1">
                        {lpo.items.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex justify-between">
                                <span>{item.quantity}x {item.itemName}</span>
                                <span className="font-mono text-xs text-slate-400">{formatKsh(item.totalCost)}</span>
                            </li>
                        ))}
                        {lpo.items.length > 3 && (
                            <li className="text-xs text-primary italic">+ {lpo.items.length - 3} more items</li>
                        )}
                    </ul>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Total Est. Cost</span>
                        <span className="text-base font-black text-slate-900 dark:text-white">{formatKsh(lpo.totalExpectedCost)}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row lg:flex-col gap-2 justify-end">
                    <button 
                        onClick={() => onPrint(lpo)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <Printer size={14} /> Print
                    </button>

                    <button 
                        onClick={() => onPrint(lpo)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                        <Eye size={14} /> Preview
                    </button>
                    
                    {lpo.status === 'Pending' && (
                        <button 
                            onClick={() => onStatusChange(lpo.id, 'Approved')}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                        >
                            Approve
                        </button>
                    )}
                    
                    {(lpo.status === 'Pending' || lpo.status === 'Approved') && (
                        <button 
                             onClick={() => onStatusChange(lpo.id, 'Cancelled')}
                             className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
             <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-600">
                <ClipboardList size={32} />
             </div>
             <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No Purchase Orders</h3>
             <p className="text-slate-400 text-sm mt-1">Create a new LPO to restock your inventory.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LPOList;