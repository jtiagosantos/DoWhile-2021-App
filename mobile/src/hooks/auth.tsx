import React, { 
  createContext, 
  useContext, 
  ReactNode, 
  useState, 
  useEffect 
} from 'react';
import * as AuthSessions from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { api } from '../services/api';

const CLIENT_ID = '606aad4436cd6c60e830';
const SCOPE = 'read:user';
const USER_STORAGE = '@nlwheat:user';
const TOKEN_STORAGE = '@nlwheat:token';


type User = {
  id: string,
  name: string,
  login: string,
  avatar_url: string,
};

type AuthContextData = {
  user: User | null,
  isSignIn: boolean,
  signIn: () => Promise<void>,
  signOut: () => Promise<void>,
};

type AuthProviderProps = {
  children: ReactNode,
};

type AuthResponse = {
  token: string,
  user: User,
};

type AuthorizationResponse = {
  params: {
    code?: string,
    error?: string,
  },
  type?: string,
};

export const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUserStorageData() {
      const userStorage = await AsyncStorage.getItem(USER_STORAGE);
      const tokenStorage = await AsyncStorage.getItem(TOKEN_STORAGE);

      if(userStorage && tokenStorage) {
        api.defaults.headers.common.authorization = `Bearer ${tokenStorage}`;
        setUser(JSON.parse(userStorage));
      }

      setIsSignIn(false);
    }

    loadUserStorageData();
  }, []);

  async function signIn() {
    try {
      setIsSignIn(true);
  
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPE}`;
      const authSessionResponse = await AuthSessions.startAsync({ authUrl }) as AuthorizationResponse;
      
      if(authSessionResponse.type === 'success' && authSessionResponse.params.error !== 'access_denied') {
        const authResponse = await api.post('authenticate', { code: authSessionResponse.params.code });
        const { user, token } = authResponse.data as AuthResponse;
  
        api.defaults.headers.common.authorization = `Bearer ${token}`;
  
        await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user));
        await AsyncStorage.setItem(TOKEN_STORAGE, token);
  
        setUser(user);
      }
    } catch(error) {
      console.log(error.message);
    } finally {
      setIsSignIn(false);
    }
  }

  async function signOut() {
    setUser(null);
    await AsyncStorage.removeItem(USER_STORAGE);
    await AsyncStorage.removeItem(TOKEN_STORAGE);
  }

  return(
    <AuthContext.Provider value={{ user, isSignIn, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

function useAuth() {
  const context = useContext(AuthContext);
  return context;
};

export { AuthProvider, useAuth };