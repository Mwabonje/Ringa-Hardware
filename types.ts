import React from 'react';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: 'TOOLS' | 'MATERIALS' | 'PPE';
  stockLevel: number;
  maxStock: number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  buyingPrice: number; // Cost to purchase
  sellingPrice: number; // Price to sell
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'LOG' | 'SALE' | 'ALERT' | 'RETURN' | 'LPO';
  meta?: any;
}

export interface Metric {
  title: string;
  value: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  colorClass: string;
  footerText?: string;
  footerClass?: string;
}

export interface SidebarLink {
  label: string;
  icon: React.ElementType;
  active?: boolean;
  badge?: string;
}

export interface ReceiptItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ReceiptData {
  transactionId: string;
  date: string;
  customerName: string;
  items: ReceiptItem[];
  subtotal?: number;
  discount?: number;
  totalPrice: number;
  paymentMethod: 'CASH' | 'MPESA';
  mpesaCode?: string;
}

export interface DailyStats {
  revenue: number;
  profit: number;
  transactionCount: number;
}

export interface LPOItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface LPO {
  id: string;
  lpoNumber: string;
  supplierName: string;
  dateIssued: string;
  expectedDate?: string;
  status: 'Pending' | 'Approved' | 'Received' | 'Cancelled';
  items: LPOItem[];
  totalExpectedCost: number;
  notes?: string;
}