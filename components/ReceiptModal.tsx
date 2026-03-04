import React from 'react';
import { Printer, X, Check, Share2 } from 'lucide-react';
import { ReceiptData } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptData | null;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200 print:bg-white print:p-0 print:block">
      
      {/* Screen Only: Close Button & Actions */}
      <div className="absolute top-4 right-4 flex gap-2 print:hidden">
         <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
            <X size={24} />
         </button>
      </div>

      <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-sm w-full animate-in zoom-in-95 duration-200 print:shadow-none print:max-w-none print:w-full print:rounded-none">
        
        {/* Receipt Header (Screen Only) */}
        <div className="bg-emerald-500 p-4 text-white text-center print:hidden">
            <div className="size-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check size={24} />
            </div>
            <h3 className="font-bold text-lg">Sale Confirmed!</h3>
            <p className="text-emerald-100 text-xs">Transaction saved successfully</p>
        </div>

        {/* The Actual Receipt (Printable Area) */}
        {/* Added text-black and dark:text-black to ensure visibility against white background regardless of theme */}
        <div id="printable-receipt" className="p-8 font-mono text-black dark:text-black print:p-0">
            <div className="text-center mb-6">
                <h2 className="text-xl font-black uppercase tracking-wider mb-1 text-black">Ringa Hardware</h2>
                <p className="text-[10px] text-slate-500 uppercase">266 Jacaranda Road, Malindi</p>
                <p className="text-[10px] text-slate-500 uppercase">Tel: +254 700 000 000</p>
            </div>

            <div className="border-b-2 border-dashed border-slate-300 my-4"></div>

            <div className="flex justify-between text-xs mb-2 text-black">
                <span className="text-slate-500">Date:</span>
                <span className="font-bold">{data.date}</span>
            </div>
            <div className="flex justify-between text-xs mb-2 text-black">
                <span className="text-slate-500">Receipt #:</span>
                <span className="font-bold">#{data.transactionId}</span>
            </div>
            {data.customerName && (
                <div className="flex justify-between text-xs mb-2 text-black">
                    <span className="text-slate-500">Customer:</span>
                    <span className="font-bold uppercase">{data.customerName}</span>
                </div>
            )}

            <div className="border-b-2 border-dashed border-slate-300 my-4"></div>

            <table className="w-full text-xs mb-4 text-black">
                <thead>
                    <tr className="text-left">
                        <th className="pb-2 text-black">Item</th>
                        <th className="pb-2 text-right text-black">Qty</th>
                        <th className="pb-2 text-right text-black">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {data.items.map((item, index) => (
                        <tr key={index}>
                            <td className="py-1 pr-2">
                                <div className="font-bold text-black">{item.itemName}</div>
                                <div className="text-[10px] text-slate-500">@ Ksh {item.unitPrice.toLocaleString()}</div>
                            </td>
                            <td className="py-1 text-right align-top text-black">{item.quantity}</td>
                            <td className="py-1 text-right align-top font-bold text-black">{item.total.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="border-t-2 border-dashed border-slate-300 pt-4 space-y-1 text-black">
                {/* Show Subtotal and Discount if discount exists */}
                {data.discount && data.discount > 0 ? (
                    <>
                        <div className="flex justify-between items-end text-xs">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-bold">Ksh {data.subtotal?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-end text-xs">
                            <span className="text-slate-500">Discount</span>
                            <span className="font-bold text-emerald-600">- Ksh {data.discount.toLocaleString()}</span>
                        </div>
                         <div className="border-b border-dashed border-slate-200 my-2"></div>
                    </>
                ) : null}

                <div className="flex justify-between items-end">
                    <span className="text-sm font-bold">TOTAL</span>
                    <span className="text-xl font-black">Ksh {data.totalPrice.toLocaleString()}</span>
                </div>
            </div>

            <div className="bg-slate-100 rounded p-3 mt-6 text-xs text-black">
                <div className="flex justify-between mb-1">
                    <span className="text-slate-500">Method:</span>
                    <span className="font-bold">{data.paymentMethod}</span>
                </div>
                {data.paymentMethod === 'MPESA' && (
                     <div className="flex justify-between">
                        <span className="text-slate-500">Ref Code:</span>
                        <span className="font-bold font-mono">{data.mpesaCode}</span>
                    </div>
                )}
            </div>

            <div className="text-center mt-8 space-y-2">
                <p className="text-[10px] text-slate-400 uppercase">Thank you for your business!</p>
                {/* Removed dark mode background classes from barcode to maintain receipt look */}
                <div className="w-full h-8 bg-slate-200 flex items-center justify-center gap-1 opacity-50">
                    {/* Fake Barcode */}
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="h-full bg-slate-900" style={{ width: Math.random() > 0.5 ? '2px' : '4px' }}></div>
                    ))}
                </div>
            </div>
        </div>

        {/* Footer Actions (Screen Only) */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 print:hidden">
            <button 
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors"
            >
                Close
            </button>
            <button 
                onClick={handlePrint}
                className="flex-1 py-2.5 text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
                <Printer size={16} />
                Print Receipt
            </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            #printable-receipt, #printable-receipt * {
                visibility: visible;
            }
            #printable-receipt {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 20px;
            }
        }
      `}</style>
    </div>
  );
};

export default ReceiptModal;