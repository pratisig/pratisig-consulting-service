import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Connexion' };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a3a5c] to-[#0d2440] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1a3a5c] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-[#e8a020] font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Connexion</h1>
          <p className="text-gray-500 text-sm mt-1">Pratisig Consulting Service</p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="text-[#1a3a5c] font-semibold hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
