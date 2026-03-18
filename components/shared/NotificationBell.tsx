'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell, X, ShoppingBag, Truck, DollarSign, Home, Calendar } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  message: string;
  at: Date;
  read: boolean;
}

function eventToMessage(event: any): string {
  switch (event.type) {
    case 'NOUVELLE_COMMANDE': return `🛒 Nouvelle commande — ${event.total?.toLocaleString('fr-FR')} FCFA`;
    case 'LIVRAISON_ACCEPTEE': return `🚴 Livraison acceptée par ${event.livreurNom}`;
    case 'LIVRAISON_LIVREE': return `✅ Livraison effectuée !`;
    case 'NOUVELLE_TRANSACTION': return `💰 Transaction ${event.service} — ${event.montant?.toLocaleString('fr-FR')} FCFA`;
    case 'DEMANDE_VISITE': return `🏠 Demande de visite de ${event.nomClient}`;
    default: return 'Nouvelle notification';
  }
}

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    esRef.current = new EventSource('/api/notifications/stream');
    esRef.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'CONNECTED') return;
        setNotifs(prev => [{
          id: crypto.randomUUID(),
          type: data.type,
          message: eventToMessage(data),
          at: new Date(),
          read: false,
        }, ...prev].slice(0, 20));
      } catch {}
    };
    return () => esRef.current?.close();
  }, []);

  const unread = notifs.filter(n => !n.read).length;

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) markAllRead(); }}
        className="relative p-2 text-blue-200 hover:text-white transition-colors"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-bold text-[#1a3a5c] text-sm">Notifications</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y">
            {notifs.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                <Bell size={32} className="mx-auto mb-2 opacity-20" />
                Aucune notification
              </div>
            ) : notifs.map((n) => (
              <div key={n.id} className={`p-3 text-sm ${n.read ? 'bg-white' : 'bg-blue-50'}`}>
                <p className="text-[#1a3a5c] font-medium">{n.message}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {n.at.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
