import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // { role, full_name, etc. }
  const [loading, setLoading] = useState(true);

  // Fetch user profile (including role)
  const fetchUserProfile = async (userId) => {
    if (!userId) {
      setUserProfile(null);
      return;
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    } else {
      setUserProfile(data);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      fetchUserProfile(currentUser?.id);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      fetchUserProfile(currentUser?.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = (email, password) => {
    // Use current origin for email redirect (works in dev and production)
    const redirectUrl = `${window.location.origin}/login`;
    return supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
  };

  const signIn = (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = () => {
    return supabase.auth.signOut();
  };

  // Helper to check if user is instructor or admin
  const isInstructor = userProfile?.role === 'instructor' || userProfile?.role === 'admin';

  const value = {
    user,
    userProfile,
    isInstructor,
    signUp,
    signIn,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
