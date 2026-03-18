import { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  trend?: string;
}

const COLOR_MAP = {
  blue: { bg: 'bg-blue-100', icon: 'text-blue-600', border: 'border-blue-200' },
  green: { bg: 'bg-green-100', icon: 'text-green-600', border: 'border-green-200' },
  yellow: { bg: 'bg-yellow-100', icon: 'text-yellow-600', border: 'border-yellow-200' },
  red: { bg: 'bg-red-100', icon: 'text-red-600', border: 'border-red-200' },
  purple: { bg: 'bg-purple-100', icon: 'text-purple-600', border: 'border-purple-200' },
};

export default function StatCard({ label, value, icon: Icon, color = 'blue', trend }: Props) {
  const c = COLOR_MAP[color];
  return (
    <div className={`bg-white border ${c.border} rounded-2xl p-5 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className="text-2xl font-bold text-[#1a3a5c] mt-1">{value}</p>
          {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
        </div>
        <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center`}>
          <Icon size={22} className={c.icon} />
        </div>
      </div>
    </div>
  );
}
