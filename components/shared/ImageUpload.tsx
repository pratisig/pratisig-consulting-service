'use client';
import { useState, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface Props {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
}

export default function ImageUpload({ value, onChange, folder = 'pratisig', className = '' }: Props) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.size > 5 * 1024 * 1024) { toast.error('Image trop grande (max 5MB)'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur upload');
      onChange(data.url);
      toast.success('Image uploadée !');
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  }

  return (
    <div className={`relative ${className}`}>
      {value ? (
        <div className="relative">
          <Image src={value} alt="Upload" width={300} height={200} className="rounded-xl object-cover w-full h-40" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
            <X size={14} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#1a3a5c] hover:bg-slate-50 transition-all">
          {loading ? (
            <Loader2 size={24} className="animate-spin text-[#1a3a5c]" />
          ) : (
            <>
              <Upload size={24} className="text-slate-400" />
              <span className="text-sm text-gray-500">Cliquer pour uploader</span>
              <span className="text-xs text-gray-400">JPG, PNG, WebP — max 5MB</span>
            </>
          )}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  );
}
