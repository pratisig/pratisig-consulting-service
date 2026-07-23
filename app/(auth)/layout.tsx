import { AuthProvider } from '@/lib/auth/auth-context';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
