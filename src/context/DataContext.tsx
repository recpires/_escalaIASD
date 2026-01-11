import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Ministry, Availability, AppState, Schedule } from '../types';

interface DataContextType extends AppState {
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  updateMinistryImage: (ministryId: string, imageUrl: string) => void;
  setAvailability: (userId: string, dates: string[]) => void;
  updateSchedule: (schedule: Schedule) => void; // Added
  login: (email: string) => boolean;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial Mock Data
const INITIAL_MINISTRIES: Ministry[] = [
  { id: '1', name: 'Música', imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=500', color: '#3B82F6' }, // Blue
  { id: '2', name: 'Diáconos', imageUrl: 'https://images.unsplash.com/photo-1576089172869-4f5f6f31562e?auto=format&fit=crop&q=80&w=500', color: '#10B981' }, // Green
  { id: '3', name: 'Diaconisas', imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=500', color: '#8B5CF6' }, // Purple
  { id: '4', name: 'Sonoplastia', imageUrl: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&q=80&w=500', color: '#F59E0B' }, // Amber
];

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sda-users');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [ministries, setMinistries] = useState<Ministry[]>(() => {
    const saved = localStorage.getItem('sda-ministries');
    return saved ? JSON.parse(saved) : INITIAL_MINISTRIES;
  });

  const [availabilities, setAvailabilities] = useState<Availability[]>(() => {
    const saved = localStorage.getItem('sda-availabilities');
    return saved ? JSON.parse(saved) : [];
  });

  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    const saved = localStorage.getItem('sda-schedules');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sda-current-user');
    return saved ? JSON.parse(saved) : null;
  });

  // Persist to LocalStorage
  useEffect(() => { localStorage.setItem('sda-users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('sda-ministries', JSON.stringify(ministries)); }, [ministries]);
  useEffect(() => { localStorage.setItem('sda-availabilities', JSON.stringify(availabilities)); }, [availabilities]);
  useEffect(() => { localStorage.setItem('sda-schedules', JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { 
    if (currentUser) localStorage.setItem('sda-current-user', JSON.stringify(currentUser));
    else localStorage.removeItem('sda-current-user');
  }, [currentUser]);

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser?.id === id) {
        setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const updateMinistryImage = (ministryId: string, imageUrl: string) => {
    setMinistries(prev => prev.map(m => m.id === ministryId ? { ...m, imageUrl } : m));
  };

  const setAvailability = (userId: string, dates: string[]) => {
    setAvailabilities(prev => {
      const existing = prev.find(a => a.userId === userId);
      if (existing) {
        return prev.map(a => a.userId === userId ? { ...a, dates } : a);
      } else {
        return [...prev, { userId, dates }];
      }
    });
  };

  const updateSchedule = (schedule: Schedule) => {
    setSchedules(prev => {
      const existing = prev.find(s => s.id === schedule.id || (s.ministryId === schedule.ministryId && s.date === schedule.date));
      if (existing) {
        return prev.map(s => (s.id === existing.id ? schedule : s));
      } else {
        return [...prev, schedule];
      }
    });
  };

  const login = (email: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <DataContext.Provider value={{
      users,
      ministries,
      availabilities,
      schedules,
      currentUser,
      addUser,
      updateUser,
      updateMinistryImage,
      setAvailability,
      updateSchedule,
      login,
      logout,
      setCurrentUser
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
