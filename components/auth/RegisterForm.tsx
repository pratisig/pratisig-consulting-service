'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerSchema } from '@/lib/validation/auth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? data.error ?? 'Erreur');
      toast.success('Compte créé ! Vous pouvez vous connecter.');
      router.push('/auth/login');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[{ name: 'name', label: 'Nom complet', type: 'text', placeholder: 'Jean Dupont' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'votre@email.com' },
        { name: 'phone', label: 'Téléphone (facultatif)', type: 'tel', placeholder: '+221 77 000 00 00' },
        { name: 'password', label: 'Mot de passe', type: 'password', placeholder: '••••••••' },
        { name: 'confirmPassword', label: 'Confirmer le mot de passe', type: 'password', placeholder: '••••••••' },
      ].map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
          <input
            type={field.type}
            name={field.name}
            value={(form as any)[field.name]}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
            placeholder={field.placeholder}
          />
        </div>
      ))}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1a3a5c] text-white py-3 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        Créer mon compte
      </button>
    </form>
  );
}
