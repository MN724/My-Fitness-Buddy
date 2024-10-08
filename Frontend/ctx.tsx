// Based on example code from Expo Docs
// Section: Using React Context and Route Groups - Example authentication context
// https://docs.expo.dev/router/reference/authentication/

import { useContext, createContext, type PropsWithChildren, useState } from 'react';
import { setStorageItemAsync, useStorageState } from './useStorageState';

const AuthContext = createContext<{
  signIn: (uid: string | null, token: string | null) => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
  uid?: string | null;
  isUid: boolean;
  token?: string | null;
  isToken: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
  uid: null,
  isUid: false,
  token: null,
  isToken: false
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const [[isUid, uid], setUid] = useStorageState('uid');
  const [[isToken, token], setToken] = useStorageState('token');
  return (
    <AuthContext.Provider
      value={{
        signIn: (uid, token) => {
          // Perform sign-in logic here
          setSession('xxx');
          setUid(uid);
          setToken(token);
        },
        signOut: () => {
          setSession(null);
          setUid(null);
          setToken(null);
        },
        session,
        isLoading,
        uid,
        isUid,
        token,
        isToken
      }}>
      {children}
    </AuthContext.Provider>
  );
}
