import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthContextType, User } from '@/types/types';

const initialUser = {
  accountId: '',
  username: '',
  email: '',
  imageUrl: '',
  providerId: '',
};

const initialState = {
  currentUser: initialUser,
  setCurrentUser: () => {},
  isLoading: false,
  isAuth: false,
  selectedDate: '',
  setSelectedDate: () => {},
};

const AuthContext = createContext<AuthContextType>(initialState);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser({
          accountId: user.uid,
          email: user.email || '',
          username: user.displayName || '',
          imageUrl: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`,
          providerId: user.providerData[0].providerId,
        });
        setIsAuth(true);
      } else {
        setCurrentUser(initialUser);
        setIsAuth(false);
      }
      setIsLoading(false);
    });

    return () => {
      unsub();
    };
  }, []);

  return <AuthContext.Provider value={{ currentUser, setCurrentUser, isLoading, isAuth, selectedDate, setSelectedDate }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthContext was used outside AuthProvider');
  return context;
}
