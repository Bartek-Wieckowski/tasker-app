import { ROUTES } from '@/routes/constants';
import { ChevronLeftCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Todopage = () => {
  return (
    <div>
      <nav>
        <Link to={ROUTES.home}>
          <ChevronLeftCircle />
        </Link>
      </nav>
    </div>
  );
};

export default Todopage;
