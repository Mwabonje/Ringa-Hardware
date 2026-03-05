import React, { useState } from 'react';
import { User, Role } from '../types';
import { Trash2, UserPlus, Shield, User as UserIcon, ShieldAlert } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  onDeleteUser: (id: string) => void;
  currentUser: User;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onDeleteUser, currentUser }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'CASHIER' as Role
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newUser.username || !newUser.password || !newUser.fullName) {
      setError('All fields are required');
      return;
    }

    const normalizedUsername = newUser.username.trim().toLowerCase();

    if (users.some(u => u.username.toLowerCase() === normalizedUsername)) {
        setError('Username already exists');
        return;
    }

    onAddUser({
      username: normalizedUsername,
      passwordHash: newUser.password, // In real app, hash this!
      fullName: newUser.fullName,
      role: newUser.role
    });

    setNewUser({ username: '', password: '', fullName: '', role: 'CASHIER' });
    setIsAdding(false);
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center gap-1"><ShieldAlert size={12} /> Super Admin</span>;
      case 'ADMIN':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1"><Shield size={12} /> Admin</span>;
      case 'CASHIER':
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold flex items-center gap-1"><UserIcon size={12} /> Cashier</span>;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">User Management</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage system access and roles</p>
        </div>
        <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
            <UserPlus size={18} />
            Add New User
        </button>
      </div>

      {isAdding && (
        <div className="mb-8 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg animate-in slide-in-from-top-4">
            <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Add New User</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                        <input 
                            type="text" 
                            value={newUser.fullName}
                            onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            placeholder="e.g. John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                        <input 
                            type="text" 
                            value={newUser.username}
                            onChange={e => setNewUser({...newUser, username: e.target.value})}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            placeholder="e.g. john.doe"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                        <input 
                            type="password" 
                            value={newUser.password}
                            onChange={e => setNewUser({...newUser, password: e.target.value})}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                        <select 
                            value={newUser.role}
                            onChange={e => setNewUser({...newUser, role: e.target.value as Role})}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                            <option value="CASHIER">Cashier</option>
                            <option value="ADMIN">Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                    </div>
                </div>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-end gap-2 pt-2">
                    <button 
                        type="button" 
                        onClick={() => setIsAdding(false)}
                        className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                    >
                        Create User
                    </button>
                </div>
            </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">User</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Role</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Created</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                            <div className="font-medium text-slate-900 dark:text-white">{user.fullName}</div>
                            <div className="text-xs text-slate-500">@{user.username}</div>
                        </td>
                        <td className="p-4">
                            {getRoleBadge(user.role)}
                        </td>
                        <td className="p-4 text-sm text-slate-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                            {user.id !== currentUser.id && (
                                <button 
                                    onClick={() => onDeleteUser(user.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete User"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
