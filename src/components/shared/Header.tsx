const Header = ({ children }: { children: React.ReactNode }) => {
  return <header className="flex justify-between py-3">{children}</header>;
};

export default Header;
