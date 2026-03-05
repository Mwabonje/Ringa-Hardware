import React from 'react';
import { History, CheckCircle2, ShoppingBag, AlertCircle, RotateCcw, MessageSquarePlus, AlertTriangle } from 'lucide-react';
import { ActivityItem, User } from '../types';

interface RecentActivityProps {
  activities: ActivityItem[];
  currentUser?: User;
  onAddNote?: (activity: ActivityItem) => void;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities, currentUser, onAddNote }) => {
  return (
    <section>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
        <History size={24} className="text-slate-400" />
        Recent Activity
      </h2>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
        {activities.map((activity, index) => {
          let Icon = CheckCircle2;
          let iconBg = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
          
          if (activity.type === 'SALE') {
            Icon = ShoppingBag;
            iconBg = 'bg-primary/10 text-primary border-primary/20';
          } else if (activity.type === 'ALERT') {
            Icon = AlertCircle;
            iconBg = 'bg-safety-orange/10 text-safety-orange border-safety-orange/20';
          } else if (activity.type === 'RETURN') {
            Icon = RotateCcw;
            iconBg = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
          }

          return (
            <div key={activity.id} className="flex gap-4 relative animate-in fade-in slide-in-from-left-4 duration-500">
              {/* Connector Line */}
              {index !== activities.length - 1 && (
                 <div className="absolute left-4 top-10 bottom-[-24px] w-px bg-slate-200 dark:bg-slate-800"></div>
              )}
             
              <div className={`size-8 rounded-full border flex items-center justify-center shrink-0 z-10 ${iconBg}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <p className="text-sm font-bold dark:text-slate-200 truncate">{activity.title}</p>
                        <p className="text-xs text-slate-500 mb-1 line-clamp-2">{activity.description}</p>
                    </div>
                    {currentUser?.role === 'SUPER_ADMIN' && onAddNote && (
                        <button 
                            onClick={() => onAddNote(activity)}
                            className="text-slate-400 hover:text-primary transition-colors p-1"
                            title="Add Note"
                        >
                            <MessageSquarePlus size={16} />
                        </button>
                    )}
                </div>
                
                {/* Admin Note Display */}
                {activity.adminNote && (
                    <div className="mt-2 mb-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-2 items-start">
                        <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 dark:text-amber-200 font-medium italic">
                            "{activity.adminNote}"
                            <span className="block text-[10px] not-italic text-amber-600/70 mt-1 uppercase font-bold">
                                - Super Admin Note
                            </span>
                        </p>
                    </div>
                )}
                
                {/* Sale Details: Payment Method & Transaction Code */}
                {activity.type === 'SALE' && activity.meta && (
                    <div className="mt-1 mb-1.5 flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                            activity.meta.paymentMethod === 'MPESA' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' 
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}>
                            {activity.meta.paymentMethod === 'MPESA' ? 'M-Pesa' : 'Cash'}
                        </span>
                        {activity.meta.paymentMethod === 'MPESA' && activity.meta.mpesaCode && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                                {activity.meta.mpesaCode}
                            </span>
                        )}
                    </div>
                )}

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                    {activity.timestamp}
                    {activity.performedBy && (
                        <>
                            <span>•</span>
                            <span className="text-slate-500 dark:text-slate-500">by {activity.performedBy}</span>
                        </>
                    )}
                </p>
              </div>
            </div>
          );
        })}
        
        <button className="w-full py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors border border-transparent hover:border-primary/20 uppercase tracking-widest mt-2">
          View All Transactions
        </button>
      </div>
    </section>
  );
};

export default RecentActivity;