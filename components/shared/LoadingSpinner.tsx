export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex items-center justify-center p-4">
      <div className={`${sizes[size]} border-4 border-slate-200 border-t-[#1a3a5c] rounded-full animate-spin`} />
    </div>
  );
}
