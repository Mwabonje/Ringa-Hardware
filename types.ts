import React from 'react';

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'CASHIER';

export interface User {
  id: string;
  username: string;
  passwordHash: string; // Storing plain text for prototype, but named hash for intent
  role: Role;
  fullName: string;
  createdAt: string;
  canMakeSales?: boolean;
}

export interface SystemSettings {
  id: string;
  isSystemLocked: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string; // 'ADMIN' for all admins, or specific user ID
  recipientName: string;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
}

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
  performedBy?: string;
  userRole?: Role;
  adminNote?: string;
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