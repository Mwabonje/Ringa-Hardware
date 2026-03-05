import React, { useState } from 'react';
import { List, ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryTableProps {
  data: InventoryItem[];
  filterActive: boolean;
  onFilterToggle: () => void;
}

const ITEMS_PER_PAGE = 5;

const InventoryTable: React.FC<InventoryTableProps> = ({ data, filterActive, onFilterToggle }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  
  // Calculate displayed data
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleExportCSV = () => {
    const headers = ['Name', 'SKU', 'Category', 'Stock Level', 'Unit', 'Status', 'Buying Price', 'Selling Price'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => 
        `"${item.name}","${item.sku}","${item.category}",${item.stockLevel},"${item.unit}","${item.status}",${item.buyingPrice},${item.sellingPrice}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'inventory_export.csv';
    link.click();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Helper to format currency
  const formatKsh = (amount: number) => {
    return `Ksh ${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <List size={24} className="text-slate-400" />
          Inventory Overview
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={onFilterToggle}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2 sm:py-1.5 rounded-lg border transition-colors ${
              filterActive 
                ? 'bg-primary text-white border-primary' 
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-300'
            }`}
          >
            <Filter size={14} />
            {filterActive ? 'Low Stock Only' : 'Filter'}
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold px-3 py-2 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors dark:text-slate-300"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-0">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Item Name</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Level</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Unit</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {currentData.length > 0 ? (
                currentData.map((item) => {
                  const stockPercent = Math.min((item.stockLevel / item.maxStock) * 100, 100);
                  let barColor = 'bg-emerald-500';
                  if (stockPercent < 20) barColor = 'bg-safety-orange';
                  if (item.stockLevel === 0) barColor = 'bg-slate-300 dark:bg-slate-600';

                  let categoryColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                  if (item.category === 'TOOLS') categoryColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
                  if (item.category === 'MATERIALS') categoryColor = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
                  if (item.category === 'PPE') categoryColor = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';

                  let statusColor = 'text-emerald-500';
                  if (item.status === 'Low Stock') statusColor = 'text-safety-orange';
                  if (item.status === 'Out of Stock') statusColor = 'text-red-500';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              {item.name}
                              {/* Mobile Status Indicator */}
                              <span className={`sm:hidden size-2 rounded-full ${statusColor.replace('text-', 'bg-')}`} title={item.status}></span>
                            </div>
                            <div className="text-[10px] text-slate-500">ID: {item.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${categoryColor}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-16 sm:w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${stockPercent}%` }}></div>
                          </div>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 tabular-nums">{item.stockLevel}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 hidden sm:table-cell">{item.unit}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${statusColor}`}>
                          <span className={`size-1.5 rounded-full ${statusColor.replace('text-', 'bg-')}`}></span>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{formatKsh(item.sellingPrice)}</div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">
                    No items found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {data.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, data.length)} of {data.length} items
            </p>
            <div className="flex gap-1">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Simple pagination: 1, 2, ... N */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                 <button 
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`size-8 flex items-center justify-center rounded border transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-white border-primary'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold">{page}</span>
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryTable;