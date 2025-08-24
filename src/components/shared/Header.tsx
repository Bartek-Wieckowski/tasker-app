export default function Header({ children }: { children: React.ReactNode }) {
  return (
    <header className="flex justify-between py-3 items-center">
      {children}
    </header>
  );
}
