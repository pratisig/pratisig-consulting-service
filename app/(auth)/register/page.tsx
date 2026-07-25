'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<'CLIENT' | 'PROPRIETAIRE'>('CLIENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password, phone || undefined, accountType);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a3a5c] to-[#0d2440] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#e8a020] rounded-2xl mb-4">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Pratisig</h1>
          <p className="text-blue-200 text-sm mt-1">Consulting Service — Inscription</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-[#1a3a5c] mb-6">Créer un compte</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c] text-sm"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c] text-sm"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c] text-sm"
                  placeholder="+221 77 000 00 00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c] text-sm"
                  placeholder="Min. 8 caractères"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c] text-sm"
                  placeholder="Confirmez le mot de passe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de compte</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType('CLIENT')}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    accountType === 'CLIENT'
                      ? 'border-[#1a3a5c] bg-[#1a3a5c]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1"></div>
                  <p className="font-semibold text-sm text-[#1a3a5c]">Client</p>
                  <p className="text-xs text-gray-500 mt-1">Acheter, louer, commander</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('PROPRIETAIRE')}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    accountType === 'PROPRIETAIRE'
                      ? 'border-[#e8a020] bg-[#e8a020]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1"></div>
                  <p className="font-semibold text-sm text-[#1a3a5c]">Propriétaire</p>
                  <p className="text-xs text-gray-500 mt-1">Publier des biens immobiliers</p>
                </button>
              </div>
              {accountType === 'PROPRIETAIRE' && (
                <p className="text-xs text-[#e8a020] mt-2 flex items-center gap-1">
                  <Shield size={12} />
                  Votre compte sera vérifié avant de pouvoir publier des biens
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e8a020] text-white py-2.5 rounded-xl font-semibold hover:bg-[#d4911d] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Création...' : "S'inscrire"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-[#1a3a5c] font-semibold hover:underline">
              Se connecter
            </Link>
          </div>
        </div>

        <p className="text-center text-blue-200 text-xs mt-6">
          © {new Date().getFullYear()} Pratisig Consulting Service — Dakar, Sénégal
        </p>
      </div>
    </div>
  );
}
