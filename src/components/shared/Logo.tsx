import { ROUTES } from '@/routes/constants';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <div className="font-['Mynerve'] font-bold text-lg md:text-3xl">
      <Link to={ROUTES.home}>tasker</Link>
    </div>
  );
};

export default Logo;
