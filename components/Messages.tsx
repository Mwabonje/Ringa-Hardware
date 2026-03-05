import React, { useState, useEffect } from 'react';
import { Message, User } from '../types';
import * as DB from '../db';
import { Mail, Send, Inbox, CheckCircle, Clock, User as UserIcon, Plus, X } from 'lucide-react';

interface MessagesProps {
  currentUser: User;
  users: User[];
  onMessageRead?: () => void;
}

const Messages: React.FC<MessagesProps> = ({ currentUser, users, onMessageRead }) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  
  // Compose State
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    loadMessages();
  }, [currentUser, activeTab]);

  const loadMessages = async () => {
    if (activeTab === 'inbox') {
      const inbox = await DB.getMessagesForUser(currentUser.id, currentUser.role);
      setMessages(inbox);
    } else {
      const sent = await DB.getSentMessages(currentUser.id);
      setMessages(sent);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId || !subject || !body) return;

    let recipientName = 'Unknown';
    if (recipientId === 'ADMIN') recipientName = 'All Admins';
    else if (recipientId === 'ALL') recipientName = 'Everyone';
    else {
      const user = users.find(u => u.id === recipientId);
      recipientName = user ? user.fullName : 'Unknown';
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      recipientId,
      recipientName,
      subject,
      body,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    await DB.sendMessage(newMessage);
    setIsComposing(false);
    setRecipientId('');
    setSubject('');
    setBody('');
    
    if (activeTab === 'sent') {
      loadMessages();
    } else {
      setActiveTab('sent');
    }
  };

  const handleSelectMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.isRead && msg.recipientId === currentUser.id) {
      await DB.markMessageAsRead(msg.id);
      // Update local state to reflect read status
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
      if (onMessageRead) onMessageRead();
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
      {/* Sidebar / Message List */}
      <div className={`w-full md:w-1/3 lg:w-1/4 flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${selectedMessage ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-white">Messages</h2>
            {currentUser.role === 'SUPER_ADMIN' && (
              <button 
                onClick={() => setIsComposing(true)}
                className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                title="Compose Message"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
          
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => { setActiveTab('inbox'); setSelectedMessage(null); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                activeTab === 'inbox' 
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Inbox size={16} /> Inbox
            </button>
            <button
              onClick={() => { setActiveTab('sent'); setSelectedMessage(null); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                activeTab === 'sent' 
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Send size={16} /> Sent
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No messages found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {messages.map(msg => (
                <button
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    selectedMessage?.id === msg.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary' : 'border-l-4 border-transparent'
                  } ${!msg.isRead && activeTab === 'inbox' ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-bold truncate ${!msg.isRead && activeTab === 'inbox' ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {activeTab === 'inbox' ? msg.senderName : `To: ${msg.recipientName}`}
                    </span>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                      {new Date(msg.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className={`text-sm mb-1 truncate ${!msg.isRead && activeTab === 'inbox' ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                    {msg.subject}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    {msg.body}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className={`flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col ${!selectedMessage ? 'hidden md:flex' : 'flex'}`}>
        {selectedMessage ? (
          <>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedMessage.subject}</h2>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <UserIcon size={16} />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {activeTab === 'inbox' ? selectedMessage.senderName : selectedMessage.senderName}
                    </span>
                  </div>
                  <span>to</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{selectedMessage.recipientName}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm text-slate-400 flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(selectedMessage.timestamp).toLocaleString()}
                </span>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="md:hidden text-slate-400 hover:text-slate-600"
                >
                  Back to list
                </button>
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                {selectedMessage.body}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Mail size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Select a message</h3>
            <p className="max-w-sm">Choose a message from the list to view its contents or compose a new one.</p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {isComposing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                <Send size={18} className="text-primary" />
                Compose Message
              </h3>
              <button 
                onClick={() => setIsComposing(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSendMessage} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Recipient</label>
                <select
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  required
                >
                  <option value="">Select Recipient</option>
                  <option value="ADMIN" className="font-bold text-primary">All Admins (Broadcast)</option>
                  {users.filter(u => u.role === 'ADMIN').map(user => (
                    <option key={user.id} value={user.id}>{user.fullName} (Admin)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="e.g. Payment Reminder"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[150px]"
                  placeholder="Type your message here..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  <Send size={18} />
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
