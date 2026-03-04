import React from 'react';
import { X, Printer, Truck } from 'lucide-react';

interface DeliveryPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

const DeliveryPreviewModal: React.FC<DeliveryPreviewModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  // Handle both LPO meta and Delivery meta structures
  const items = data.items || [];
  const notes = data.notes || '';
  const date = data.date || data.dateReceived || new Date().toLocaleDateString();
  const id = data.deliveryId || data.lpoNumber || 'DEL-????';
  const supplier = data.supplier || 'Unknown Supplier';
  const driver = data.driver || data.driverName;
  const plate = data.plate || data.plateNumber || data.vehiclePlate;
  const deliveryNumber = data.deliveryNumber;
  const receivedBy = data.receivedBy;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200 print:bg-white print:p-0 print:block">
      
      {/* Screen Only: Close Button */}
      <div className="absolute top-4 right-4 flex gap-2 print:hidden">
         <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
            <X size={24} />
         </button>
      </div>

      <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-md w-full animate-in zoom-in-95 duration-200 print:shadow-none print:max-w-none print:w-full print:rounded-none">
        
        {/* Header (Screen Only) */}
        <div className="bg-blue-600 p-4 text-white text-center print:hidden">
            <div className="size-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Truck size={24} />
            </div>
            <h3 className="font-bold text-lg">Delivery Details</h3>
            <p className="text-blue-100 text-xs">Incoming Stock Record</p>
        </div>

        {/* Printable Area */}
        <div id="printable-delivery" className="p-8 font-mono text-black dark:text-black print:p-0">
            <div className="text-center mb-6">
                <h2 className="text-xl font-black uppercase tracking-wider mb-1 text-black">Ringa Hardware</h2>
                <p className="text-[10px] text-slate-500 uppercase">Goods Received Note</p>
            </div>

            <div className="border-b-2 border-dashed border-slate-300 my-4"></div>

            <div className="flex justify-between text-xs mb-2 text-black">
                <span className="text-slate-500">Date:</span>
                <span className="font-bold">{date}</span>
            </div>
            <div className="flex justify-between text-xs mb-2 text-black">
                <span className="text-slate-500">Ref ID:</span>
                <span className="font-bold">{id}</span>
            </div>
            
            {deliveryNumber && (
                <div className="flex justify-between text-xs mb-2 text-black">
                    <span className="text-slate-500">Delivery No:</span>
                    <span className="font-bold">{deliveryNumber}</span>
                </div>
            )}

            <div className="flex justify-between text-xs mb-2 text-black">
                <span className="text-slate-500">Supplier:</span>
                <span className="font-bold">{supplier}</span>
            </div>
            
            {driver && (
                <div className="flex justify-between text-xs mb-2 text-black">
                    <span className="text-slate-500">Driver:</span>
                    <span className="font-bold">{driver} {plate ? `(${plate})` : ''}</span>
                </div>
            )}

            {receivedBy && (
                <div className="flex justify-between text-xs mb-2 text-black">
                    <span className="text-slate-500">Received By:</span>
                    <span className="font-bold">{receivedBy}</span>
                </div>
            )}

            <div className="border-b-2 border-dashed border-slate-300 my-4"></div>

            <div className="mb-2 text-xs font-bold uppercase text-slate-500">Received Items</div>
            <table className="w-full text-xs mb-4 text-black">
                <thead>
                    <tr className="text-left border-b border-slate-200">
                        <th className="pb-2 text-black">Item</th>
                        <th className="pb-2 text-right text-black">Qty</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {items.map((item: any, index: number) => (
                        <tr key={index}>
                            <td className="py-2 pr-2">
                                <div className="font-bold text-black">{item.itemName || item.name}</div>
                            </td>
                            <td className="py-2 text-right align-top text-black">{item.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {notes && (
                <div className="bg-slate-50 p-3 rounded border border-slate-100 mt-4">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Notes</p>
                    <p className="text-xs text-black italic">{notes}</p>
                </div>
            )}

            <div className="text-center mt-8 space-y-2">
                 {receivedBy ? (
                    <div className="border-t border-slate-300 w-1/2 mx-auto pt-2">
                        <p className="text-sm font-bold text-black">{receivedBy}</p>
                        <p className="text-[10px] text-slate-400 uppercase">Received By</p>
                    </div>
                 ) : (
                    <div className="border-t border-slate-300 w-1/2 mx-auto pt-2">
                        <p className="text-[10px] text-slate-400 uppercase">Received By (Signature)</p>
                    </div>
                 )}
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
                Print GRN
            </button>
        </div>
      </div>

      <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            #printable-delivery, #printable-delivery * {
                visibility: visible;
            }
            #printable-delivery {
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

export default DeliveryPreviewModal;
