import { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Icon size={56} className="mb-4 opacity-20" />
      <h3 className="text-lg font-semibold text-gray-600 mb-1">{title}</h3>
      {description && <p className="text-sm text-center max-w-xs">{description}</p>}
      {action && (
        <a href={action.href} className="mt-4 bg-[#1a3a5c] text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-[#0d2440] transition-colors">
          {action.label}
        </a>
      )}
    </div>
  );
}
