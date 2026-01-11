import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Ministry, Availability, AppState, Schedule } from '../types';
import { supabase } from '../lib/supabase';

interface DataContextType extends AppState {
  addUser: (user: User) => Promise<boolean>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  updateMinistryImage: (ministryId: string, imageUrl: string) => Promise<void>;
  setAvailability: (userId: string, dates: string[]) => Promise<void>;
  updateSchedule: (schedule: Schedule) => Promise<void>;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial Data Fetch & Realtime Subscription
  useEffect(() => {
    let mounted = true;

    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
        if (mounted && loading) {
            console.warn("Auth initialization timed out, forcing loading=false");
            setLoading(false);
        }
    }, 20000);

    const initAuth = async () => {
      console.log("Initializing Auth...");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log("Session found, fetching user profile...");
          await fetchCurrentUser(session.user.id);
          console.log("User profile fetched.");
        } else {
            console.log("No session found.");
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        if (mounted) {
            console.log("Auth init complete, setting loading=false");
            setLoading(false);
            clearTimeout(safetyTimeout);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth State Change:", event);
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchCurrentUser(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    fetchInitialData();
    setupSubscriptions();

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);




  const fetchCurrentUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    console.log(`[fetchCurrentUser] Starting for ${userId}`);
    try {
      console.log(`[fetchCurrentUser] Selecting profile... [VERSION: TIMEOUT-15s]`);
      
      // Create a timeout promise (Increased to 15s for slower connections)
      const timeoutPromise = new Promise<{ data: any, error: any }>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao buscar perfil (15s limit)')), 15000)
      );

      // Race against the actual query
      let { data, error } = await Promise.race([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single(),
        timeoutPromise
      ]);
      
      console.log(`[fetchCurrentUser] Select result:`, { data, error });

      // If profile missing, try to create it (fallback for legacy users or failed triggers)
      if (!data && (error?.code === 'PGRST116' || !error)) { // PGRST116 is 'not found'
         console.warn("Profile missing, attempting to create...");
         const { data: userData } = await supabase.auth.getUser();
         const email = userData.user?.email || '';
         const name = userData.user?.user_metadata?.name || email.split('@')[0];
         
         console.log(`[fetchCurrentUser] Inserting new profile for ${email}...`);
         // Include ministry_ids to ensure no constraint issues
         const { error: insertError } = await supabase.from('profiles').insert({
             id: userId,
             name: name,
             role: 'member', // Default role
             ministry_ids: [] 
         });
         console.log(`[fetchCurrentUser] Insert result:`, { insertError });
         
         if (insertError) {
             return { success: false, error: `Erro ao criar perfil: ${insertError.message}` };
         }

         if (!insertError) {
             // Retry fetch
             console.log(`[fetchCurrentUser] Retrying fetch...`);
             const retry = await supabase.from('profiles').select('*').eq('id', userId).single();
             data = retry.data;
             error = retry.error;
             console.log(`[fetchCurrentUser] Retry result:`, { data, error });
         }
      }

      if (error) {
           return { success: false, error: `Erro ao buscar perfil: ${error.message}` };
      }
      
      if (data) {
        console.log(`[fetchCurrentUser] Setting user state`);
        setCurrentUser({
          id: data.id,
          name: data.name,
          email: '', // Email comes from auth.user usually
          role: data.role,
          ministryIds: data.ministry_ids || []
        });
        return { success: true };
      }
      return { success: false, error: 'Perfil não encontrado após tentativa de criação.' };
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      return { success: false, error: error.message || 'Erro desconhecido ao carregar perfil.' };
    } finally {
        console.log(`[fetchCurrentUser] Finished for ${userId}`);
    }
  };

  // ... (fetchInitialData and setupSubscriptions remain the same) ... Since I cannot skip lines effectively without Context, I will assume the user has the file open and I am targeting the fetchCurrentUser block which appeared earlier in previous turn, but wait. `replace_file_content` targets lines.
  // The line numbers in previous `view_file` (Step 492) showed fetchCurrentUser at line 85.
  // BUT I am using `replace_file_content` which replaces a range.
  // I need to be careful with `login` function which is further down (line 264).
  // I should probably use `multi_replace_file_content` to update BOTH `fetchCurrentUser` and `login`.
  
  // Let's cancel this call and use multi_replace.


  const fetchInitialData = async () => {
      // Fetch Ministries
      const { data: ministriesData } = await supabase.from('ministries').select('*');
      if (ministriesData) {
          setMinistries(ministriesData.map(m => ({
              id: m.id,
              name: m.name,
              imageUrl: m.image_url,
              color: m.color
          })));
      }

      // Fetch Profiles (Users)
      const { data: profilesData } = await supabase.from('profiles').select('*');
      if (profilesData) {
          setUsers(profilesData.map(p => ({
              id: p.id,
              name: p.name,
              email: '',
              role: p.role,
              ministryIds: p.ministry_ids || []
          })));
      }
      
      // Fetch Schedules
      const { data: schedulesData } = await supabase.from('schedules').select('*');
      if (schedulesData) {
          setSchedules(schedulesData.map(s => ({
              id: s.id,
              ministryId: s.ministry_id,
              date: s.date,
              memberIds: s.member_ids || [],
              memberDetails: s.member_details || {}
          })));
      }

      // Fetch Availabilities
      const { data: availData } = await supabase.from('availabilities').select('*');
      if (availData) {
          setAvailabilities(availData.map(a => ({
              userId: a.user_id,
              dates: a.dates || []
          })));
      }
  };

  const setupSubscriptions = () => {
      // Subscribe to changes
      supabase.channel('public:all').on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchInitialData(); // Lazy refresh for now
      }).subscribe();
  };

  // Actions
  const addUser = async (user: User) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: user.email,
            password: user.password!,
            options: {
                data: {
                    name: user.name,
                    role: user.role,
                    ministry_ids: user.ministryIds
                }
            }
        });

        if (error) throw error;
        
        if (data.user) {
             // Profile trigger ideally handles this, but doing it manually for safety if trigger missing
             const { error: profileError } = await supabase.from('profiles').insert({
                 id: data.user.id,
                 name: user.name,
                 role: user.role,
                 ministry_ids: user.ministryIds
             });
             // Ignore duplicate key error if trigger already did it
             if (profileError && !profileError.message.includes('duplicate key')) {
                 console.error('Error creating profile manually:', profileError);
             }
        }
        return true;
    } catch (e) {
        console.error("Registration Error", e);
        throw e;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    await supabase.from('profiles').update({
        name: updates.name,
        role: updates.role,
        ministry_ids: updates.ministryIds
    }).eq('id', id);
  };

  const updateMinistryImage = async (ministryId: string, imageUrl: string) => {
      await supabase.from('ministries').update({ image_url: imageUrl }).eq('id', ministryId);
  };

  const setAvailability = async (userId: string, dates: string[]) => {
      await supabase.from('availabilities').upsert({
          user_id: userId,
          dates: dates,
          updated_at: new Date().toISOString()
      });
  };

  const updateSchedule = async (schedule: Schedule) => {
      // Remove 'id' from the payload if it's a new generated one, let DB handle it?
      // Actually, if we use UUIDs, we should probably let DB generate or ensure our local ID is valid UUID.
      // The current frontend generates "0.something" random IDs. This WILL FAIL uuid validation in Postgres.
      // We must omit ID if it's new, but our interface requires it.
      // Strategy: Send without ID if it looks like a math.random ID, or let Supabase generate.
      
      const payload: any = {
          ministry_id: schedule.ministryId,
          date: schedule.date,
          member_ids: schedule.memberIds,
          member_details: schedule.memberDetails,
          created_at: new Date().toISOString()
      };

      // Check if ID is a valid UUID (simple check). If not, don't send it, let DB gen new one.
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(schedule.id);
      if (isUUID) {
          payload.id = schedule.id;
      }

      await supabase.from('schedules').upsert(payload);
  };

  const login = async (email: string, password?: string) => {
      if (!password) return { success: false, error: 'Senha obrigatória' };
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
          console.error("Login Error", error);
          return { success: false, error: error.message };
      }
      
      let profileResult: { success: boolean; error?: string } = { success: false, error: 'Perfil não carregado' };
      if (data.user) {
          // Explicitly wait for profile to be loaded before returning
          profileResult = await fetchCurrentUser(data.user.id);
      }
      
      return profileResult;
  };

  const logout = () => {
    supabase.auth.signOut();
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
      setCurrentUser,
      loading
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
