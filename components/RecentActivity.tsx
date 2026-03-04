import React from 'react';
import { History, CheckCircle2, ShoppingBag, AlertCircle, RotateCcw } from 'lucide-react';
import { ActivityItem } from '../types';

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
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
              <div>
                <p className="text-sm font-bold dark:text-slate-200">{activity.title}</p>
                <p className="text-xs text-slate-500 mb-1">{activity.description}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{activity.timestamp}</p>
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