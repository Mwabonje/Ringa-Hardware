import React, { useState, useEffect } from 'react';
import { X, Save, FileText, User, Car, Clock, Eye, Layers, Package, Wrench, HardHat, CreditCard, Banknote, Smartphone, Plus, Trash2, Building2, Calendar, PackagePlus, ArrowLeft, Receipt, Percent, Tag } from 'lucide-react';
import { InventoryItem, LPO } from '../types';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (items: { itemId: string; quantity: number; price: number }[], notes: string, meta?: any) => void;
  type: 'DELIVERY' | 'SALE' | 'RETURN' | 'LPO' | null;
  inventory: InventoryItem[];
  lpos: LPO[];
}

interface CartItem {
  itemId: string;
  quantity: number;
  price: number;
  newSellingPrice?: number;
  isNew?: boolean;
  newItemData?: {
      name: string;
      category: 'TOOLS' | 'MATERIALS' | 'PPE';
      unit: string;
      sellingPrice: number;
  };
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, onSubmit, type, inventory, lpos }) => {
  // State for multiple items
  const [cartItems, setCartItems] = useState<CartItem[]>([{ itemId: '', quantity: 1, price: 0 }]);
  
  const [notes, setNotes] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Delivery specific fields
  const [selectedLpoId, setSelectedLpoId] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [deliveryNumber, setDeliveryNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [timeReceived, setTimeReceived] = useState('');

  // Sale specific fields
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MPESA'>('CASH');
  const [mpesaCode, setMpesaCode] = useState('');
  
  // Discount Fields
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');

  // LPO Specific fields
  const [supplierName, setSupplierName] = useState('');
  const [expectedDate, setExpectedDate] = useState('');

  // Error State
  const [error, setError] = useState<string | null>(null);

  // Filter inventory for the dropdowns
  const filteredInventory = inventory.filter(item => 
    activeCategory === 'ALL' ? true : item.category === activeCategory
  );

  // Helper to format currency
  const formatKsh = (amount: number) => {
    return `Ksh ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Helper to get active price based on transaction type
  const getTransactionPrice = (item: InventoryItem) => {
    // If we are Buying (Delivery) or Ordering (LPO), use Buying Price (Cost)
    if (type === 'DELIVERY' || type === 'LPO') return item.buyingPrice;
    return item.sellingPrice; // SALE or RETURN
  };

  // Calculate Subtotal (Sum of items)
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, cartItem) => {
      return sum + (cartItem.price * cartItem.quantity);
    }, 0);
  };

  // Calculate Final Grand Total (Subtract Discount)
  const subtotal = calculateSubtotal();
  
  let discountAmount = 0;
  if (type === 'SALE') {
    if (discountType === 'PERCENTAGE') {
        discountAmount = subtotal * (discountValue / 100);
    } else {
        discountAmount = discountValue;
    }
  }
  
  // Ensure we don't go below zero
  const grandTotal = Math.max(0, subtotal - discountAmount);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveCategory('ALL');
      
      // Initialize with first available item and its price
      const defaultItem = inventory[0];
      const defaultPrice = defaultItem ? getTransactionPrice(defaultItem) : 0;
      
      setCartItems([{ 
        itemId: defaultItem?.id || '', 
        quantity: 1, 
        price: defaultPrice,
        newSellingPrice: defaultItem?.sellingPrice,
        isNew: false 
      }]);
      
      setNotes('');
      setSelectedLpoId('');
      setPoNumber('');
      setDeliveryNumber('');
      setDriverName('');
      setPlateNumber('');
      setCustomerName('');
      setPaymentMethod('CASH');
      setMpesaCode('');
      setSupplierName('');
      setExpectedDate('');
      setDiscountValue(0);
      setDiscountType('PERCENTAGE');
      setError(null);
      
      const now = new Date();
      setTimeReceived(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }
  }, [isOpen, inventory, type]);

  // --- Item Management Handlers ---

  const handleAddItem = () => {
    // Add new row with first available item in current filter
    const defaultItem = filteredInventory[0] || inventory[0];
    const defaultId = defaultItem?.id || '';
    const defaultPrice = defaultItem ? getTransactionPrice(defaultItem) : 0;
    
    setCartItems([...cartItems, { 
        itemId: defaultId, 
        quantity: 1, 
        price: defaultPrice, 
        newSellingPrice: defaultItem?.sellingPrice,
        isNew: false 
    }]);
  };

  const handleRemoveItem = (index: number) => {
    if (cartItems.length > 1) {
      const newItems = [...cartItems];
      newItems.splice(index, 1);
      setCartItems(newItems);
    }
  };

  const handleItemChange = (index: number, field: keyof CartItem, value: any) => {
    const newItems = [...cartItems];
    
    if (field === 'itemId') {
      // When item changes, also update the price default
      const item = inventory.find(i => i.id === value);
      const newPrice = item ? getTransactionPrice(item) : 0;
      newItems[index] = { 
        ...newItems[index], 
        itemId: String(value), 
        price: newPrice,
        newSellingPrice: item?.sellingPrice
      };
    } else {
      // @ts-ignore
      newItems[index] = { ...newItems[index], [field]: value };
    }
    
    setCartItems(newItems);
  };

  const handleNewItemDataChange = (index: number, field: string, value: any) => {
    const newItems = [...cartItems];
    if (newItems[index].newItemData) {
        newItems[index].newItemData = { ...newItems[index].newItemData!, [field]: value };
        setCartItems(newItems);
    }
  };

  const handleLpoSelect = (lpoId: string) => {
    setSelectedLpoId(lpoId);
    const lpo = lpos.find(l => l.id === lpoId);
    if (lpo) {
        setPoNumber(lpo.lpoNumber);
        setSupplierName(lpo.supplierName);
        
        const newItems = lpo.items.map(item => {
            const invItem = inventory.find(i => i.id === item.itemId);
            return {
                itemId: item.itemId,
                quantity: item.quantity,
                price: item.unitCost,
                newSellingPrice: invItem?.sellingPrice,
                isNew: false
            };
        });
        
        if (newItems.length > 0) {
            setCartItems(newItems);
        }
    } else {
        setPoNumber('');
        setSupplierName('');
    }
  };

  const toggleNewItemMode = (index: number) => {
    const newItems = [...cartItems];
    const current = newItems[index];

    if (!current.isNew) {
        // Switch TO new item mode
        newItems[index] = {
            ...current,
            itemId: `NEW_${Date.now()}_${index}`, // Temp ID
            isNew: true,
            newItemData: { 
                name: '', 
                category: 'TOOLS', 
                unit: 'pcs', 
                sellingPrice: 0 
            },
            price: 0 // Reset cost to 0 for user to input
        };
    } else {
        // Switch BACK to existing item mode
        const defaultItem = filteredInventory[0] || inventory[0];
        newItems[index] = {
            ...current,
            itemId: defaultItem?.id || '',
            isNew: false,
            newItemData: undefined,
            price: defaultItem ? getTransactionPrice(defaultItem) : 0,
            newSellingPrice: defaultItem?.sellingPrice
        };
    }
    setCartItems(newItems);
  };

  // --- Preview Logic ---

  const getPreviewText = () => {
    const itemCount = cartItems.length;
    const itemSummary = cartItems.map(c => {
        if (c.isNew && c.newItemData) {
            return `${c.newItemData.name} (New) (x${c.quantity})`;
        }
        const i = inventory.find(inv => inv.id === c.itemId);
        return i ? `${i.name} (x${c.quantity})` : 'Unknown';
    }).join(', ');

    if (type === 'DELIVERY') {
        const details = [
            `Items (${itemCount}): ${itemSummary}`,
            deliveryNumber && `Del #: ${deliveryNumber}`,
            poNumber && `PO: ${poNumber}`,
            driverName && `Driver: ${driverName}`,
            plateNumber && `Plate: ${plateNumber}`,
            timeReceived && `Time: ${timeReceived}`,
            `Total Cost: ${formatKsh(grandTotal)}`
        ].filter(Boolean).join(' • ');
        return notes ? `${details} \nNote: ${notes}` : details;
    } else if (type === 'SALE') {
        const paymentDetails = paymentMethod === 'CASH' ? 'Cash' : `M-Pesa: ${mpesaCode}`;
        const discountText = discountAmount > 0 ? ` (Disc: -${formatKsh(discountAmount)})` : '';
        const details = [
            `Items: ${itemSummary}`,
            customerName && `Customer: ${customerName}`,
            `Payment: ${paymentDetails}`,
            `Total: ${formatKsh(grandTotal)}${discountText}`
        ].filter(Boolean).join(' • ');
        return notes ? `${details} \nNote: ${notes}` : details;
    } else if (type === 'LPO') {
       const details = [
            `Supplier: ${supplierName || 'N/A'}`,
            `Items: ${itemSummary}`,
            `Est. Cost: ${formatKsh(grandTotal)}`,
            expectedDate && `Expected: ${expectedDate}`
       ].filter(Boolean).join(' • ');
       return notes ? `${details} \nNote: ${notes}` : details;
    }
    return notes;
  };

  const previewText = getPreviewText();

  if (!isOpen || !type) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate fields
    if (type === 'SALE' && paymentMethod === 'MPESA' && !mpesaCode.trim()) {
        setError("Please enter the M-Pesa transaction code.");
        return; 
    }
    
    if (type === 'LPO' && !supplierName.trim()) {
        setError("Please enter a Supplier Name");
        return;
    }

    if (type === 'DELIVERY' && !driverName.trim()) {
        setError("Please enter the Driver Name");
        return;
    }

    // Validate new items
    for (const item of cartItems) {
        if (item.isNew) {
            if (!item.newItemData?.name.trim()) {
                setError("Please enter a name for the new item.");
                return;
            }
        } else if (!item.itemId) {
            // Filter out empty existing items if any
            continue;
        } else if (type === 'SALE') {
            // Check stock level for sales
            const inventoryItem = inventory.find(i => i.id === item.itemId);
            if (inventoryItem && item.quantity > inventoryItem.stockLevel) {
                setError(`Cannot sell ${item.quantity} of "${inventoryItem.name}". Only ${inventoryItem.stockLevel} in stock.`);
                return;
            }
        }
    }

    const validItems = cartItems.filter(i => i.itemId);
    if (validItems.length === 0) {
        setError("Please add at least one item.");
        return;
    }

    let submissionNotes = notes;
    let metaData: any = {};
    const newItemsDefinitions = cartItems
        .filter(i => i.isNew && i.newItemData)
        .map(i => ({
            tempId: i.itemId,
            ...i.newItemData,
            buyingPrice: i.price // Current price input is the buying cost
        }));

    if (type === 'DELIVERY') {
      submissionNotes = getPreviewText();
      metaData = {
          newItemsDefinitions,
          driverName,
          vehiclePlate: plateNumber,
          poNumber,
          deliveryNumber,
          linkedLpoId: selectedLpoId,
          supplierName
      };
    } else if (type === 'SALE') {
      const paymentDetails = paymentMethod === 'CASH' ? 'Cash' : `M-Pesa: ${mpesaCode}`;
      const discountInfo = discountAmount > 0 ? `With ${formatKsh(discountAmount)} discount. ` : '';
      submissionNotes = `${customerName ? `Cust: ${customerName}` : 'Walk-in'} • ${paymentDetails} • Total: ${formatKsh(grandTotal)}`;
      if (notes) submissionNotes += ` • ${notes}`;
      
      metaData = {
        customerName,
        paymentMethod,
        mpesaCode,
        totalPrice: grandTotal,
        subtotal: subtotal,
        discount: discountAmount
      };
    } else if (type === 'LPO') {
      submissionNotes = getPreviewText();
      metaData = {
        supplierName,
        expectedDate,
        totalExpectedCost: grandTotal,
        newItemsDefinitions: newItemsDefinitions
      };
    }

    onSubmit(validItems, submissionNotes, metaData);
    onClose();
  };

  const getTitle = () => {
    switch(type) {
      case 'DELIVERY': return 'Log Incoming Delivery';
      case 'SALE': return 'Record New Sale';
      case 'RETURN': return 'Log Customer Return';
      case 'LPO': return 'Create Purchase Order (LPO)';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto flex flex-col m-4">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10 shrink-0">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{getTitle()}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
          
          {/* Category Filter - Only show if not in new item mode largely */}
          {!cartItems.every(i => i.isNew) && (
            <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 pb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Filter Item List</label>
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg gap-1">
                    {[
                    { id: 'ALL', icon: Layers, label: 'All' },
                    { id: 'TOOLS', icon: Wrench, label: 'Tools' },
                    { id: 'MATERIALS', icon: Package, label: 'Materials' },
                    { id: 'PPE', icon: HardHat, label: 'PPE' }
                    ].map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold uppercase rounded-md transition-all ${
                        activeCategory === cat.id
                            ? 'bg-white dark:bg-slate-700 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                        }`}
                    >
                        <cat.icon size={12} />
                        <span className="hidden sm:inline">{cat.label}</span>
                    </button>
                    ))}
                </div>
            </div>
          )}

          {/* Item List */}
          <div className="space-y-3">
             <div className="flex justify-between items-end">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Items ({cartItems.length})
                </label>
             </div>
             
             {cartItems.map((cartItem, index) => {
                 return (
                    <div key={index} className={`flex flex-col gap-2 p-3 rounded-lg border transition-all ${cartItem.isNew ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800' : 'border-transparent'}`}>
                        <div className="flex gap-2 items-start">
                             {/* Item Select / Name Input */}
                            <div className="flex-1 min-w-0">
                                <label className="text-[10px] text-slate-400 font-bold uppercase mb-0.5 block flex justify-between">
                                    {cartItem.isNew ? 'New Item Name' : 'Item'}
                                    {cartItem.isNew && <span className="text-blue-500">Manual Entry</span>}
                                </label>
                                {cartItem.isNew ? (
                                    <input 
                                        type="text" 
                                        placeholder="Enter Item Name"
                                        value={cartItem.newItemData?.name || ''}
                                        onChange={(e) => handleNewItemDataChange(index, 'name', e.target.value)}
                                        className="w-full rounded-lg border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm py-2"
                                        autoFocus
                                    />
                                ) : (
                                    <div className="flex gap-1">
                                        <select 
                                            value={cartItem.itemId}
                                            onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm py-2"
                                        >
                                            <option value="" disabled>Select Item</option>
                                            {inventory.map(item => {
                                                if (activeCategory !== 'ALL' && item.category !== activeCategory && item.id !== cartItem.itemId) return null;
                                                return (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Type Toggle for LPO and DELIVERY */}
                            {(type === 'LPO' || type === 'DELIVERY') && (
                                <div className="pt-6">
                                    <button 
                                        type="button"
                                        onClick={() => toggleNewItemMode(index)}
                                        className={`p-2 rounded-lg transition-colors border ${
                                            cartItem.isNew 
                                            ? 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700' 
                                            : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:text-primary hover:border-primary'
                                        }`}
                                        title={cartItem.isNew ? "Select Existing Item" : "Create New Item"}
                                    >
                                        {cartItem.isNew ? <ArrowLeft size={16} /> : <PackagePlus size={16} />}
                                    </button>
                                </div>
                            )}

                            {/* Remove Button */}
                            <div className="pt-6">
                                <button 
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    disabled={cartItems.length === 1}
                                    className={`p-2 rounded-lg transition-colors ${
                                        cartItems.length === 1 
                                        ? 'text-slate-300 cursor-not-allowed' 
                                        : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                    }`}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Second Row: Price & Quantity */}
                        <div className="flex gap-2">
                             <div className="flex-1">
                                <label className="text-[10px] text-slate-400 font-bold uppercase mb-0.5 block">
                                    {(type === 'LPO' || type === 'DELIVERY') ? 'Unit Cost (Ksh)' : 'Price (Ksh)'}
                                </label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={cartItem.price}
                                    onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm py-2 px-2"
                                />
                            </div>

                            {/* New Selling Price Field for Deliveries */}
                            {type === 'DELIVERY' && !cartItem.isNew && (
                                <div className="flex-1">
                                    <label className="text-[10px] text-emerald-500 font-bold uppercase mb-0.5 block">
                                        Selling Price
                                    </label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={cartItem.newSellingPrice || 0}
                                        onChange={(e) => handleItemChange(index, 'newSellingPrice', parseFloat(e.target.value) || 0)}
                                        className="w-full rounded-lg border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-slate-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500 text-sm py-2 px-2"
                                    />
                                </div>
                            )}

                            <div className="w-24">
                                <label className="text-[10px] text-slate-400 font-bold uppercase mb-0.5 block">Qty</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={cartItem.quantity}
                                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm py-2 px-2 text-center"
                                />
                            </div>
                        </div>

                        {/* Third Row: Extra fields for New Items */}
                        {cartItem.isNew && (
                            <div className="grid grid-cols-3 gap-2 pt-1 animate-in slide-in-from-top-2 duration-200">
                                <div>
                                    <label className="text-[10px] text-blue-400 font-bold uppercase mb-0.5 block">Category</label>
                                    <select 
                                        value={cartItem.newItemData?.category}
                                        onChange={(e) => handleNewItemDataChange(index, 'category', e.target.value)}
                                        className="w-full rounded-lg border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-xs py-1.5"
                                    >
                                        <option value="TOOLS">Tools</option>
                                        <option value="MATERIALS">Materials</option>
                                        <option value="PPE">PPE</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-blue-400 font-bold uppercase mb-0.5 block">Unit</label>
                                    <input 
                                        type="text"
                                        placeholder="pcs, kg..." 
                                        value={cartItem.newItemData?.unit}
                                        onChange={(e) => handleNewItemDataChange(index, 'unit', e.target.value)}
                                        className="w-full rounded-lg border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-xs py-1.5 px-2"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-blue-400 font-bold uppercase mb-0.5 block">Selling Price</label>
                                    <input 
                                        type="number"
                                        min="0"
                                        value={cartItem.newItemData?.sellingPrice}
                                        onChange={(e) => handleNewItemDataChange(index, 'sellingPrice', parseFloat(e.target.value) || 0)}
                                        className="w-full rounded-lg border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-xs py-1.5 px-2"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                 );
             })}

             <button 
                type="button"
                onClick={handleAddItem}
                className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
             >
                <Plus size={14} />
                Add Another Item
             </button>
          </div>
          
          {/* Totals Display */}
          <div className="flex flex-col gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
             {type === 'SALE' && (
                <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatKsh(subtotal)}</span>
                </div>
             )}
             {type === 'SALE' && discountAmount > 0 && (
                <div className="flex justify-between items-center text-xs text-emerald-500 font-medium">
                    <span>Discount</span>
                    <span className="font-mono">-{formatKsh(discountAmount)}</span>
                </div>
             )}
             <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm font-bold text-slate-500 uppercase">
                    {type === 'DELIVERY' || type === 'LPO' ? 'Total Cost' : 'Grand Total'}
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white">{formatKsh(grandTotal)}</span>
             </div>
          </div>

          {/* LPO Specifics */}
          {type === 'LPO' && (
             <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Building2 size={12} /> Supplier Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Apex Cement Distributors Ltd"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Calendar size={12} /> Expected Delivery Date (Optional)
                    </label>
                    <input 
                      type="date" 
                      value={expectedDate}
                      onChange={(e) => setExpectedDate(e.target.value)}
                      className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm"
                    />
                 </div>
             </div>
          )}

          {/* Delivery Specifics */}
          {type === 'DELIVERY' && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <FileText size={12} /> Link Approved LPO (Optional)
                    </label>
                    <select 
                        value={selectedLpoId}
                        onChange={(e) => handleLpoSelect(e.target.value)}
                        className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm"
                    >
                        <option value="">Select LPO to Receive...</option>
                        {lpos.filter(l => l.status === 'Approved').map(lpo => (
                            <option key={lpo.id} value={lpo.id}>
                                {lpo.lpoNumber} - {lpo.supplierName} ({lpo.items.length} items)
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <Clock size={12} /> Time Received
                        </label>
                        <input 
                        type="time" 
                        value={timeReceived}
                        onChange={(e) => setTimeReceived(e.target.value)}
                        className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm"
                        />
                    </div>
                    <div className="flex-1">
                         <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <FileText size={12} /> Delivery Number
                        </label>
                        <input 
                        type="text" 
                        placeholder="e.g. DN-8839"
                        value={deliveryNumber}
                        onChange={(e) => setDeliveryNumber(e.target.value)}
                        className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm"
                        />
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                         <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <FileText size={12} /> PO Number
                        </label>
                        <input 
                        type="text" 
                        placeholder="PO-2023-001"
                        value={poNumber}
                        onChange={(e) => setPoNumber(e.target.value)}
                        className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <User size={12} /> Driver Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          placeholder="John Doe"
                          value={driverName}
                          onChange={(e) => setDriverName(e.target.value)}
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <Car size={12} /> Plate Number
                        </label>
                        <input 
                          type="text" 
                          placeholder="ABC 1234"
                          value={plateNumber}
                          onChange={(e) => setPlateNumber(e.target.value)}
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm"
                        />
                    </div>
                </div>
            </div>
          )}

          {/* Sale Specifics (Payment & Discount) */}
          {type === 'SALE' && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                 {/* Discount Section */}
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Tag size={12} /> Discount
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <input 
                                type="number" 
                                min="0"
                                value={discountValue}
                                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                                className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm pl-8"
                            />
                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                                {discountType === 'FIXED' ? <span className="text-xs font-bold">Ksh</span> : <Percent size={14} />}
                            </div>
                        </div>
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                             <button
                                type="button"
                                onClick={() => setDiscountType('PERCENTAGE')}
                                className={`px-3 text-xs font-bold rounded-md transition-all ${discountType === 'PERCENTAGE' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}
                             >
                                %
                             </button>
                             <button
                                type="button"
                                onClick={() => setDiscountType('FIXED')}
                                className={`px-3 text-xs font-bold rounded-md transition-all ${discountType === 'FIXED' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}
                             >
                                Ksh
                             </button>
                        </div>
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <User size={12} /> Customer Name (Optional)
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Walk-in or Company Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm"
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <CreditCard size={12} /> Payment Method <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('CASH')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-bold transition-all ${
                                paymentMethod === 'CASH' 
                                ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            <Banknote size={16} />
                            Cash
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('MPESA')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-bold transition-all ${
                                paymentMethod === 'MPESA' 
                                ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            <Smartphone size={16} />
                            M-Pesa
                        </button>
                    </div>
                 </div>
                 
                 {paymentMethod === 'MPESA' && (
                     <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <Receipt size={12} /> Transaction Code <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          required={paymentMethod === 'MPESA'}
                          placeholder="e.g. QEH83729"
                          value={mpesaCode}
                          onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm uppercase font-mono"
                        />
                     </div>
                 )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                {type === 'DELIVERY' ? 'Additional Notes' : type === 'LPO' ? 'Order Notes' : 'Notes / Remarks'}
            </label>
            <textarea 
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={type === 'SALE' ? "Additional sale info..." : type === 'RETURN' ? "e.g., Damaged item" : "Optional notes..."}
              className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm"
            ></textarea>
          </div>

          {/* Log/Receipt Preview Section */}
          {(type === 'DELIVERY' || type === 'SALE' || type === 'LPO') && previewText && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="flex items-center gap-2 mb-1.5">
                 {type === 'SALE' ? <CreditCard size={12} className="text-blue-500"/> : <Eye size={12} className="text-blue-500" />}
                 <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide">
                    {type === 'SALE' ? 'Sale Summary' : type === 'LPO' ? 'Order Preview' : 'Log Preview'}
                 </p>
               </div>
               <div className="text-sm text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap pl-5 border-l-2 border-blue-200 dark:border-blue-800">
                 {previewText}
               </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2 shrink-0">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}
            <div className="flex justify-end gap-3">
                <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                Cancel
                </button>
                <button 
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                >
                <Save size={16} />
                Confirm {type === 'SALE' ? 'Sale' : type === 'LPO' ? 'Order' : 'Action'}
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActionModal;