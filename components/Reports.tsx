import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { ActivityItem, InventoryItem, LPO, DailyStats } from '../types';
import { 
  TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, Calendar, 
  ArrowUpRight, ArrowDownRight, CreditCard, Banknote, Smartphone 
} from 'lucide-react';

interface ReportsProps {
  activities: ActivityItem[];
  inventory: InventoryItem[];
  lpos: LPO[];
  stats: DailyStats;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Reports: React.FC<ReportsProps> = ({ activities, inventory, lpos, stats }) => {
  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days');

  // --- Calculations ---

  // 1. Inventory Value & Health
  const inventoryMetrics = useMemo(() => {
    let totalCostValue = 0;
    let totalRetailValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    inventory.forEach(item => {
      totalCostValue += item.buyingPrice * item.stockLevel;
      totalRetailValue += item.sellingPrice * item.stockLevel;
      if (item.status === 'Low Stock') lowStockCount++;
      if (item.status === 'Out of Stock') outOfStockCount++;
    });

    return {
      totalCostValue,
      totalRetailValue,
      potentialProfit: totalRetailValue - totalCostValue,
      lowStockCount,
      outOfStockCount,
      totalItems: inventory.length
    };
  }, [inventory]);

  // 2. Sales Trends (Revenue over time)
  const salesTrendData = useMemo(() => {
    const sales = activities.filter(a => a.type === 'SALE');
    const days = timeRange === '7days' ? 7 : 30;
    const data: { date: string; revenue: number; profit: number }[] = [];
    
    // Initialize last N days with 0
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      data.push({ date: dateStr, revenue: 0, profit: 0 });
    }

    // Aggregate sales
    sales.forEach(sale => {
      // Parse "Just now" or date string
      let saleDate = new Date();
      if (sale.timestamp !== 'Just now') {
         // This is tricky if timestamp format varies, assuming locale string for now or recent
         // In a real app, use ISO strings for timestamps
         // For this demo, we might only catch "today" if it says "Just now" or matches today's date
         // Let's try to parse the meta.date if available
         if (sale.meta?.date) {
             saleDate = new Date(sale.meta.date);
         }
      }

      const dateStr = saleDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const dayData = data.find(d => d.date === dateStr);
      
      if (dayData && sale.meta) {
        dayData.revenue += (sale.meta.totalPrice || 0);
        // Profit calculation needs cost, which might not be directly in meta unless we put it there
        // For now, let's estimate or use subtotal - discount if cost isn't there
        // Ideally, we should store profit in the sale meta
        // Let's assume a 20% margin if profit isn't tracked, or just show revenue
        // Actually, let's look at dailyStats for today, but for history we need item cost
        // We'll stick to Revenue for the chart to be safe
      }
    });

    return data;
  }, [activities, timeRange]);

  // 3. Top Selling Items
  const topProducts = useMemo(() => {
    const sales = activities.filter(a => a.type === 'SALE');
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    sales.forEach(sale => {
      if (sale.meta?.items) {
        sale.meta.items.forEach((item: any) => {
          const existing = productMap.get(item.itemName) || { name: item.itemName, quantity: 0, revenue: 0 };
          existing.quantity += item.quantity;
          existing.revenue += item.total;
          productMap.set(item.itemName, existing);
        });
      }
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [activities]);

  // 4. Payment Methods Distribution
  const paymentMethods = useMemo(() => {
    const sales = activities.filter(a => a.type === 'SALE');
    let cash = 0;
    let mpesa = 0;

    sales.forEach(sale => {
      if (sale.meta?.paymentMethod === 'MPESA') mpesa += (sale.meta.totalPrice || 0);
      else cash += (sale.meta.totalPrice || 0);
    });

    return [
      { name: 'Cash', value: cash },
      { name: 'M-Pesa', value: mpesa }
    ];
  }, [activities]);

  const formatKsh = (amount: number) => {
    return `Ksh ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold dark:text-white">Business Reports</h2>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <button
            onClick={() => setTimeRange('7days')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${timeRange === '7days' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}
            >
            Last 7 Days
            </button>
            <button
            onClick={() => setTimeRange('30days')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${timeRange === '30days' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}
            >
            Last 30 Days
            </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue (Today) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <TrendingUp size={20} />
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Total Revenue (Today)</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatKsh(stats.revenue)}</h3>
        </div>

        {/* Inventory Value */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <Package size={20} />
                </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">Inventory Value (Cost)</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatKsh(inventoryMetrics.totalCostValue)}</h3>
            <p className="text-xs text-slate-400 mt-1">Retail Value: {formatKsh(inventoryMetrics.totalRetailValue)}</p>
        </div>

        {/* Potential Profit */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                    <DollarSign size={20} />
                </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">Potential Profit (Stock)</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatKsh(inventoryMetrics.potentialProfit)}</h3>
        </div>

         {/* Stock Alerts */}
         <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={20} />
                </div>
                {inventoryMetrics.outOfStockCount > 0 && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">{inventoryMetrics.outOfStockCount} Out</span>
                )}
            </div>
            <p className="text-slate-500 text-sm font-medium">Low Stock Alerts</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{inventoryMetrics.lowStockCount} Items</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Revenue Trend</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesTrendData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fill: '#64748b'}} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fill: '#64748b'}} 
                            tickFormatter={(value) => `Ksh ${value/1000}k`}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => [`Ksh ${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorRevenue)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Payment Methods Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Payment Methods</h3>
            <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={paymentMethods}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {paymentMethods.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `Ksh ${value.toLocaleString()}`} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <p className="text-xs text-slate-400 font-bold uppercase">Total</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                            {formatKsh(paymentMethods.reduce((a, b) => a + b.value, 0))}
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-6 space-y-3">
                {paymentMethods.map((method, index) => (
                    <div key={method.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="size-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{method.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{formatKsh(method.value)}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Selling Products</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-bold text-xs">
                    <tr>
                        <th className="px-6 py-3">Product Name</th>
                        <th className="px-6 py-3 text-center">Quantity Sold</th>
                        <th className="px-6 py-3 text-right">Total Revenue</th>
                        <th className="px-6 py-3 text-right">Performance</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {topProducts.length > 0 ? (
                        topProducts.map((product, index) => (
                            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                    {product.name}
                                </td>
                                <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-300">
                                    {product.quantity}
                                </td>
                                <td className="px-6 py-4 text-right font-mono font-medium text-slate-900 dark:text-white">
                                    {formatKsh(product.revenue)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 text-emerald-500 text-xs font-bold">
                                        <TrendingUp size={14} />
                                        High
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                                No sales data available yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
