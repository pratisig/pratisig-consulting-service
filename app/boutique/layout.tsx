import CartWidget from '@/components/boutique/CartWidget';

export default function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CartWidget />
    </>
  );
}
