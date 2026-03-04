import React, { useState, useEffect } from 'react';
import { Truck, BarChart3, ShoppingCart, RotateCcw, Eye, Loader2 } from 'lucide-react'; 
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatCards from './components/StatCards';
import InventoryTable from './components/InventoryTable';
import QuickActions from './components/QuickActions';
import RecentActivity from './components/RecentActivity';
import ActionModal from './components/ActionModal';
import ReceiptModal from './components/ReceiptModal';
import LPOList from './components/LPOList';
import LPOModal from './components/LPOModal';
import ReturnPreviewModal from './components/ReturnPreviewModal';
import DeliveryPreviewModal from './components/DeliveryPreviewModal';
import Login from './components/Login';
import Reports from './components/Reports';
import { InventoryItem, ActivityItem, ReceiptData, ReceiptItem, DailyStats, LPO } from './types';
import * as DB from './db';

function App() {
  // App State - Initialize auth from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAuth = localStorage.getItem('ringa_auth');
    return savedAuth === 'true';
  });

  const [activeTab, setActiveTab] = useState('Dashboard');
  
  // App State - Initialized empty, loaded from DB
  const [isLoading, setIsLoading] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [lpos, setLpos] = useState<LPO[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    revenue: 0,
    profit: 0,
    transactionCount: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isLowStockFilterActive, setIsLowStockFilterActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // LPO Modal State
  const [lpoModalState, setLpoModalState] = useState<{
    isOpen: boolean;
    lpo: LPO | null;
  }>({ isOpen: false, lpo: null });

  // Return Preview Modal State
  const [returnPreviewState, setReturnPreviewState] = useState<{
    isOpen: boolean;
    data: any;
  }>({ isOpen: false, data: null });

  // Delivery Preview Modal State
  const [deliveryPreviewState, setDeliveryPreviewState] = useState<{
    isOpen: boolean;
    data: any;
  }>({ isOpen: false, data: null });
  
  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'DELIVERY' | 'SALE' | 'RETURN' | 'LPO' | null;
  }>({ isOpen: false, type: null });

  // Receipt State
  const [receiptState, setReceiptState] = useState<{
    isOpen: boolean;
    data: ReceiptData | null;
  }>({ isOpen: false, data: null });

  // --- Auth Handlers ---
  const handleLogin = () => {
    localStorage.setItem('ringa_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('ringa_auth');
    setIsAuthenticated(false);
    // Resetting local state is optional since we unmount, but good practice
    setActiveTab('Dashboard');
  };

  // --- Data Loading ---
  useEffect(() => {
    if (isAuthenticated) {
        setIsLoading(true);
        const loadData = async () => {
            try {
                const data = await DB.getAllData();
                setInventory(data.inventory);
                setActivities(data.activities);
                setLpos(data.lpos);
                setDailyStats(data.stats);
            } catch (error) {
                console.error("Failed to load data from DB", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }
  }, [isAuthenticated]);

  // Filter Logic Helper
  const getFilteredData = (categoryFilter?: string) => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = isLowStockFilterActive ? (item.status === 'Low Stock' || item.status === 'Out of Stock') : true;
      const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
      
      return matchesSearch && matchesFilter && matchesCategory;
    });
  };

  // Handle LPO Status Changes (e.g., Receiving items updates stock)
  const handleLPOStatusChange = async (lpoId: string, newStatus: LPO['status'], meta?: any) => {
    const lpo = lpos.find(l => l.id === lpoId);
    if (!lpo) return;

    if (newStatus === 'Received' && lpo.status !== 'Received') {
        // Update Inventory locally
        const updatedInventory = [...inventory];
        lpo.items.forEach(orderItem => {
            const itemIndex = updatedInventory.findIndex(i => i.id === orderItem.itemId);
            if (itemIndex > -1) {
                updatedInventory[itemIndex] = {
                    ...updatedInventory[itemIndex],
                    stockLevel: updatedInventory[itemIndex].stockLevel + orderItem.quantity,
                    status: (updatedInventory[itemIndex].stockLevel + orderItem.quantity) > 0 ? 'In Stock' : 'Out of Stock'
                };
            }
        });

        // Add Activity Log
        const newActivity: ActivityItem = {
            id: Date.now().toString(),
            title: `LPO Received: ${lpo.supplierName}`,
            description: `Order #${lpo.lpoNumber} • ${lpo.items.length} items added to stock`,
            timestamp: 'Just now',
            type: 'LOG',
            meta: {
                lpoId: lpo.id,
                lpoNumber: lpo.lpoNumber,
                supplier: lpo.supplierName,
                // Ensure we map all items correctly for the delivery preview
                items: lpo.items.map(item => ({
                    itemId: item.itemId,
                    itemName: item.itemName,
                    quantity: item.quantity,
                    cost: item.unitCost
                })),
                dateReceived: new Date().toLocaleString(),
                ...meta
            }
        };

        // Persist updates
        await DB.updateInventoryBatch(updatedInventory);
        await DB.addActivity(newActivity);

        // Update Local State
        setInventory(updatedInventory);
        setActivities([newActivity, ...activities]);
    }

    // Update LPO Status
    const updatedLPO = { ...lpo, status: newStatus };
    await DB.updateLPO(updatedLPO);
    
    setLpos(prev => prev.map(p => p.id === lpoId ? updatedLPO : p));
  };

  // Handle Actions (Sale, Delivery, Return, LPO Creation)
  const handleAction = async (items: { itemId: string; quantity: number; price: number }[], notes: string, meta?: any) => {
    // Generate Timestamp ID for the entire batch
    const transactionId = Date.now().toString();
    const shortId = transactionId.slice(-6);
    
    // Check for NEW Manual Items first (mainly from LPO)
    let currentInventory = [...inventory];
    let finalItems = [...items];

    if (meta?.newItemsDefinitions && meta.newItemsDefinitions.length > 0) {
        // Process new definitions
        for (const def of meta.newItemsDefinitions) {
            const newId = Date.now().toString() + Math.random().toString().slice(2,5);
            const newItem: InventoryItem = {
                id: newId,
                name: def.name,
                sku: `GEN-${newId.slice(-5)}`, // Auto-generated SKU
                category: def.category,
                stockLevel: 0, // Starts at 0 until received
                maxStock: 50, // Default max stock
                unit: def.unit,
                status: 'Out of Stock',
                buyingPrice: def.buyingPrice,
                sellingPrice: def.sellingPrice
            };
            
            // Persist new item definition
            await DB.addInventoryItem(newItem);
            
            // Add to local inventory array
            currentInventory.unshift(newItem);
            
            // Replace the temp ID in the items list with the real ID
            finalItems = finalItems.map(i => {
                if (i.itemId === def.tempId) {
                    return { ...i, itemId: newId };
                }
                return i;
            });
        }
        setInventory(currentInventory);
    }

    // If it's an LPO, we don't update inventory immediately, we just create the LPO record
    if (modalState.type === 'LPO') {
        const newLPO: LPO = {
            id: transactionId,
            lpoNumber: `PO-${shortId}`,
            supplierName: meta.supplierName,
            dateIssued: new Date().toLocaleDateString(),
            expectedDate: meta.expectedDate,
            status: 'Pending',
            items: finalItems.map(i => {
                const invItem = currentInventory.find(inv => inv.id === i.itemId);
                return {
                    itemId: i.itemId,
                    itemName: invItem?.name || 'Unknown',
                    quantity: i.quantity,
                    unitCost: i.price,
                    totalCost: i.price * i.quantity
                };
            }),
            totalExpectedCost: meta.totalExpectedCost,
            notes
        };
        
        await DB.addLPO(newLPO);
        setLpos([newLPO, ...lpos]);
        
        // Log creation
        const lpoActivity: ActivityItem = {
            id: transactionId,
            title: `New LPO Created`,
            description: `Order #${newLPO.lpoNumber} for ${meta.supplierName}`,
            timestamp: 'Just now',
            type: 'LPO'
        };
        await DB.addActivity(lpoActivity);
        setActivities([lpoActivity, ...activities]);
        
        setLpoModalState({ isOpen: true, lpo: newLPO });
        return; 
    }

    // Check if this delivery is linked to an LPO
    if (modalState.type === 'DELIVERY' && meta?.linkedLpoId) {
        const lpo = lpos.find(l => l.id === meta.linkedLpoId);
        if (lpo) {
            // Mark LPO as Received
            const updatedLPO: LPO = { ...lpo, status: 'Received' };
            await DB.updateLPO(updatedLPO);
            setLpos(prev => prev.map(p => p.id === lpo.id ? updatedLPO : p));
        }
    }

    let updatedInventory = [...currentInventory];
    let totalItemsProcessed = 0;
    const receiptItems: ReceiptItem[] = [];
    
    // Track batch financial impact before discount
    let batchRawRevenue = 0;
    let batchTotalCost = 0;

    // Process each item in the batch
    finalItems.forEach(cartItem => {
      const itemIndex = updatedInventory.findIndex(i => i.id === cartItem.itemId);
      if (itemIndex === -1) return;

      const item = updatedInventory[itemIndex];
      let newStockLevel = item.stockLevel;

      if (modalState.type === 'DELIVERY') {
        newStockLevel += cartItem.quantity;
      } else if (modalState.type === 'SALE') {
        newStockLevel = Math.max(0, newStockLevel - cartItem.quantity);
        
        // Calculate Raw Revenue and Cost for this item
        const itemRevenue = cartItem.price * cartItem.quantity;
        const itemCost = item.buyingPrice * cartItem.quantity;
        
        batchRawRevenue += itemRevenue;
        batchTotalCost += itemCost;

      } else if (modalState.type === 'RETURN') {
        newStockLevel += cartItem.quantity;
      }

      // Update Status based on new stock
      let newStatus: InventoryItem['status'] = 'In Stock';
      if (newStockLevel === 0) newStatus = 'Out of Stock';
      else if (newStockLevel < item.maxStock * 0.2) newStatus = 'Low Stock';

      // Update the inventory array
      updatedInventory[itemIndex] = {
        ...item,
        stockLevel: newStockLevel,
        status: newStatus
      };

      totalItemsProcessed += cartItem.quantity;

      // Prepare data for receipt if it's a sale
      if (modalState.type === 'SALE') {
        receiptItems.push({
          itemName: item.name,
          quantity: cartItem.quantity,
          unitPrice: cartItem.price, // Use the overridden price
          total: cartItem.price * cartItem.quantity
        });
      }
    });

    // Batch Update DB
    await DB.updateInventoryBatch(updatedInventory);
    setInventory(updatedInventory);

    // Update Daily Stats if Sale
    if (modalState.type === 'SALE') {
        // Apply Discount Logic
        const discountAmount = meta?.discount || 0;
        const finalRevenue = Math.max(0, batchRawRevenue - discountAmount);
        const finalProfit = finalRevenue - batchTotalCost;
        
        const newStats = {
            revenue: dailyStats.revenue + finalRevenue,
            profit: dailyStats.profit + finalProfit,
            transactionCount: dailyStats.transactionCount + 1
        };

        setDailyStats(newStats);
        await DB.updateStats(newStats);
    }

    // Create a summarized Activity Log entry
    let activityTitle = '';
    let activityType: ActivityItem['type'] = 'LOG';
    let activityDescription = notes || `Manual entry (${finalItems.length} line items)`;
    let activityMeta: any = null;

    const firstItemName = updatedInventory.find(i => i.id === finalItems[0].itemId)?.name || 'Unknown Item';
    const otherCount = finalItems.length - 1;
    const itemSummary = otherCount > 0 ? `${firstItemName} +${otherCount} others` : firstItemName;

    if (modalState.type === 'DELIVERY') {
      activityTitle = `Delivery: ${totalItemsProcessed} Items`;
      activityType = 'LOG';
      
      activityMeta = {
          deliveryId: `DEL-${shortId}`,
          date: new Date().toLocaleString(),
          supplier: meta?.supplierName || 'Unknown Supplier',
          items: finalItems.map(i => ({
             itemId: i.itemId,
             itemName: updatedInventory.find(inv => inv.id === i.itemId)?.name || 'Unknown',
             quantity: i.quantity,
             cost: i.price
          })),
          driver: meta?.driverName,
          plate: meta?.vehiclePlate,
          deliveryNumber: meta?.deliveryNumber,
          notes: notes
      };
    } else if (modalState.type === 'SALE') {
      activityTitle = `Sale: ${itemSummary}`;
      activityType = 'SALE';
      
      activityMeta = {
          transactionId: shortId,
          date: new Date().toLocaleString(),
          customerName: meta?.customerName || 'Walk-in Customer',
          items: receiptItems,
          totalPrice: meta?.totalPrice || 0, // This is the Final (Discounted) Total
          subtotal: meta?.subtotal,
          discount: meta?.discount,
          paymentMethod: meta?.paymentMethod || 'CASH',
          mpesaCode: meta?.mpesaCode
      };
    } else if (modalState.type === 'RETURN') {
      activityTitle = `Return: ${itemSummary}`;
      activityType = 'RETURN';
      
      const itemDetails = finalItems.map(i => {
         const invItem = updatedInventory.find(inv => inv.id === i.itemId);
         return `${i.quantity}x ${invItem?.name || 'Unknown'}`;
      }).join(', ');
      
      activityDescription = notes ? `${itemDetails} • ${notes}` : itemDetails;

      activityMeta = {
        returnId: `RET-${shortId}`,
        originalDate: new Date().toLocaleDateString(),
        notes: notes,
        items: finalItems.map(i => ({
             itemId: i.itemId,
             itemName: updatedInventory.find(inv => inv.id === i.itemId)?.name || 'Unknown',
             quantity: i.quantity,
             price: i.price
        }))
      };
    }

    // Add Activity
    const newActivity: ActivityItem = {
      id: transactionId,
      title: activityTitle,
      description: activityDescription,
      timestamp: 'Just now',
      type: activityType,
      meta: activityMeta
    };
    
    await DB.addActivity(newActivity);
    setActivities([newActivity, ...activities]);

    // If Sale, trigger receipt with all items
    if (modalState.type === 'SALE' && meta) {
        setReceiptState({
            isOpen: true,
            data: activityMeta
        });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Inventory':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-bold dark:text-white">Full Store Inventory</h2>
             </div>
             <InventoryTable 
                data={getFilteredData()} 
                filterActive={isLowStockFilterActive}
                onFilterToggle={() => setIsLowStockFilterActive(!isLowStockFilterActive)}
             />
          </div>
        );
      case 'Sales':
        const salesLogs = activities.filter(a => a.type === 'SALE');
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold dark:text-white">Sales History</h2>
             </div>
             <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  {salesLogs.length > 0 ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {salesLogs.map(log => (
                        <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                           <div className="size-10 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <ShoppingCart size={20} />
                           </div>
                           <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-900 dark:text-white truncate">{log.title}</p>
                              <p className="text-sm text-slate-500 truncate">{log.description}</p>
                           </div>
                           <div className="ml-auto flex items-center gap-4">
                               <div className="text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap hidden sm:block">
                                  {log.timestamp}
                               </div>
                               {log.meta && (
                                   <button 
                                     onClick={() => setReceiptState({ isOpen: true, data: log.meta })}
                                     className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                     title="View Receipt"
                                   >
                                      <Eye size={18} />
                                   </button>
                               )}
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500">No sales recorded yet.</div>
                  )}
               </div>
          </div>
        );
      case 'LPO':
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <LPOList 
                    lpos={lpos} 
                    onStatusChange={handleLPOStatusChange}
                    onPrint={(lpo) => setLpoModalState({ isOpen: true, lpo })} 
                />
            </div>
        );
      case 'Deliveries':
         const deliveryLogs = activities.filter(a => a.type === 'LOG');
         return (
            <div className="space-y-6 animate-in fade-in duration-500">
               <h2 className="text-xl sm:text-2xl font-bold dark:text-white">Incoming Deliveries</h2>
               <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  {deliveryLogs.length > 0 ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {deliveryLogs.map(log => (
                        <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                           <div className="size-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center shrink-0">
                              <Truck size={20} />
                           </div>
                           <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-900 dark:text-white truncate">{log.title}</p>
                              <p className="text-sm text-slate-500 truncate">{log.description}</p>
                           </div>
                           <div className="ml-auto flex items-center gap-4">
                               <div className="text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap hidden sm:block">
                                  {log.timestamp}
                               </div>
                               <button 
                                 onClick={() => {
                                   // Fallback for old logs without meta
                                   const metaData = log.meta || { 
                                      notes: log.description, 
                                      date: log.timestamp,
                                      supplier: log.title.includes('LPO') ? log.title.split(':')[1].trim() : 'Unknown'
                                   };
                                   setDeliveryPreviewState({ isOpen: true, data: metaData });
                                 }}
                                 className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                 title="View Delivery Details"
                               >
                                  <Eye size={18} />
                               </button>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500">No delivery logs found.</div>
                  )}
               </div>
            </div>
         );
      case 'Returns':
         const returnLogs = activities.filter(a => a.type === 'RETURN');
         return (
            <div className="space-y-6 animate-in fade-in duration-500">
               <h2 className="text-xl sm:text-2xl font-bold dark:text-white flex items-center gap-2">
                  <RotateCcw size={24} className="text-slate-400" />
                  Customer Returns
               </h2>
               <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  {returnLogs.length > 0 ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {returnLogs.map(log => (
                        <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                           <div className="size-10 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center shrink-0">
                              <RotateCcw size={20} />
                           </div>
                           <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                {log.title.startsWith('Return:') ? log.title.replace('Return:', '').trim() : log.title}
                              </p>
                              <p className="text-sm text-slate-500">
                                {log.description}
                              </p>
                           </div>
                           
                           <div className="flex items-center gap-4">
                               <div className="text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap hidden sm:block">
                                  {log.timestamp}
                               </div>
                               <button 
                                 onClick={() => {
                                   const metaData = log.meta || { items: [], notes: log.description }; 
                                   setReturnPreviewState({ isOpen: true, data: metaData })
                                 }}
                                 className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                 title="Preview Return Details"
                               >
                                  <Eye size={18} />
                               </button>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500">No returns recorded yet.</div>
                  )}
               </div>
            </div>
         );
      case 'Reports':
        return (
           <Reports 
              activities={activities} 
              inventory={inventory} 
              lpos={lpos} 
              stats={dailyStats} 
           />
        );
      case 'Dashboard':
      default:
        return (
          <div className="animate-in fade-in duration-500">
            <StatCards inventory={inventory} stats={dailyStats} lpos={lpos} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pb-8">
              <div className="col-span-1 lg:col-span-8">
                <InventoryTable 
                  data={getFilteredData()} 
                  filterActive={isLowStockFilterActive}
                  onFilterToggle={() => setIsLowStockFilterActive(!isLowStockFilterActive)}
                />
              </div>
              <div className="col-span-1 lg:col-span-4 space-y-6 lg:space-y-8">
                <QuickActions 
                  onAction={(type) => setModalState({ isOpen: true, type })} 
                />
                <RecentActivity activities={activities} />
              </div>
            </div>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (isLoading) {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
        }} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-background-dark relative">
        <Header 
          onSearch={setSearchQuery} 
          searchValue={searchQuery}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
             {renderContent()}
          </div>
        </div>
      </main>

      {/* Action Modal */}
      <ActionModal 
        isOpen={modalState.isOpen}
        type={modalState.type}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSubmit={handleAction}
        inventory={inventory}
        lpos={lpos}
      />

      {/* Receipt Modal */}
      <ReceiptModal 
        isOpen={receiptState.isOpen}
        data={receiptState.data}
        onClose={() => setReceiptState({ isOpen: false, data: null })}
      />

      {/* LPO Modal */}
      <LPOModal
        isOpen={lpoModalState.isOpen}
        lpo={lpoModalState.lpo}
        onClose={() => setLpoModalState({ isOpen: false, lpo: null })}
      />

      {/* Return Preview Modal */}
      <ReturnPreviewModal
        isOpen={returnPreviewState.isOpen}
        data={returnPreviewState.data}
        onClose={() => setReturnPreviewState({ isOpen: false, data: null })}
      />

      {/* Delivery Preview Modal */}
      <DeliveryPreviewModal
        isOpen={deliveryPreviewState.isOpen}
        data={deliveryPreviewState.data}
        onClose={() => setDeliveryPreviewState({ isOpen: false, data: null })}
      />
    </div>
  );
}

export default App;