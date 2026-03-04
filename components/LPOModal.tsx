import React from 'react';
import { Printer, X, FileText, Calendar, Building2 } from 'lucide-react';
import { LPO } from '../types';

interface LPOModalProps {
  isOpen: boolean;
  onClose: () => void;
  lpo: LPO | null;
}

const LPOModal: React.FC<LPOModalProps> = ({ isOpen, onClose, lpo }) => {
  if (!isOpen || !lpo) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatKsh = (amount: number) => `Ksh ${amount.toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200 print:bg-white print:p-0 print:block">
      
      {/* Screen Only: Close Button */}
      <div className="absolute top-4 right-4 flex gap-2 print:hidden">
         <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
            <X size={24} />
         </button>
      </div>

      <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-2xl w-full animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] print:shadow-none print:max-w-none print:w-full print:rounded-none print:h-auto print:max-h-none print:block">
        
        {/* Modal Header (Screen Only) */}
        <div className="bg-slate-100 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between print:hidden shrink-0">
            <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    <FileText size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Purchase Order Preview</h3>
                    <p className="text-slate-500 text-xs">#{lpo.lpoNumber}</p>
                </div>
            </div>
        </div>

        {/* Printable Area - Explicitly force text color to be dark even in dark mode because background is white */}
        <div id="printable-lpo" className="p-8 text-slate-900 dark:text-slate-900 overflow-y-auto flex-1 print:p-0 print:text-black print:overflow-visible">
            {/* Document Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-black uppercase text-slate-900 dark:text-slate-900 tracking-tight mb-2">Purchase Order</h1>
                    <div className="text-sm text-slate-500 space-y-1">
                        <p className="font-bold text-slate-900 dark:text-slate-900">Ringa Hardware</p>
                        <p>266 Jacaranda Road, Malindi</p>
                        <p>Tel: +254 700 000 000</p>
                        <p>Email: orders@ringahardware.com</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="mb-4">
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">PO Number</span>
                        <span className="text-xl font-mono font-bold text-slate-900 dark:text-slate-900">{lpo.lpoNumber}</span>
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Date Issued</span>
                        <span className="font-medium text-slate-900 dark:text-slate-900">{lpo.dateIssued}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 print:border-slate-300">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Building2 size={14} /> Supplier
                    </h4>
                    <p className="font-bold text-lg text-slate-900 dark:text-slate-900">{lpo.supplierName}</p>
                    <p className="text-sm text-slate-500 mt-1">Authorized Vendor</p>
                </div>
                 <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 print:border-slate-300">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Calendar size={14} /> Delivery Details
                    </h4>
                    <p className="text-sm text-slate-900 dark:text-slate-900"><span className="font-semibold">Expected Date:</span> {lpo.expectedDate || 'N/A'}</p>
                    <p className="text-sm mt-1 text-slate-900 dark:text-slate-900"><span className="font-semibold">Status:</span> <span className="uppercase">{lpo.status}</span></p>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b-2 border-slate-900 dark:border-slate-900">
                        <th className="text-left py-3 px-2 font-bold uppercase text-xs text-slate-900 dark:text-slate-900">Item Description</th>
                        <th className="text-right py-3 px-2 font-bold uppercase text-xs text-slate-900 dark:text-slate-900">Quantity</th>
                        <th className="text-right py-3 px-2 font-bold uppercase text-xs text-slate-900 dark:text-slate-900">Unit Cost</th>
                        <th className="text-right py-3 px-2 font-bold uppercase text-xs text-slate-900 dark:text-slate-900">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {lpo.items.map((item, index) => (
                        <tr key={index}>
                            <td className="py-3 px-2 text-sm font-medium text-slate-900 dark:text-slate-900">{item.itemName}</td>
                            <td className="py-3 px-2 text-sm text-right text-slate-900 dark:text-slate-900">{item.quantity}</td>
                            <td className="py-3 px-2 text-sm text-right font-mono text-slate-500">{formatKsh(item.unitCost)}</td>
                            <td className="py-3 px-2 text-sm text-right font-bold font-mono text-slate-900 dark:text-slate-900">{formatKsh(item.totalCost)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t-2 border-slate-900 dark:border-slate-900">
                        <td colSpan={3} className="pt-4 text-right font-bold uppercase text-sm text-slate-900 dark:text-slate-900">Total Expected Cost</td>
                        <td className="pt-4 px-2 text-right font-black text-xl text-slate-900 dark:text-slate-900">{formatKsh(lpo.totalExpectedCost)}</td>
                    </tr>
                </tfoot>
            </table>

            {lpo.notes && (
                <div className="mb-12">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes / Instructions</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100 print:border-none print:p-0 print:bg-transparent italic">
                        {lpo.notes}
                    </p>
                </div>
            )}

            <div className="flex gap-12 mt-12 pt-12 border-t border-slate-200 print:mt-24">
                <div className="flex-1">
                    <div className="border-b border-slate-400 h-8"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-2">Authorized Signature</p>
                </div>
                <div className="flex-1">
                    <div className="border-b border-slate-400 h-8"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-2">Date</p>
                </div>
            </div>
        </div>

        {/* Footer Actions (Screen Only) */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 print:hidden shrink-0">
            <button 
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors"
            >
                Close
            </button>
            <button 
                onClick={handlePrint}
                className="px-6 py-2.5 text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
                <Printer size={16} />
                Print Purchase Order
            </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            #printable-lpo, #printable-lpo * {
                visibility: visible;
            }
            #printable-lpo {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 40px; 
            }
            .print\\:bg-white { background-color: white !important; }
            .print\\:text-black { color: black !important; }
            .print\\:border-slate-300 { border-color: #cbd5e1 !important; }
        }
      `}</style>
    </div>
  );
};

export default LPOModal;