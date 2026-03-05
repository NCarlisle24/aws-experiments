
import { AuthContextData } from './data/AuthContextData';
import React from 'react';

const AuthContext = React.createContext<AuthContextData | null>(null);

export default AuthContext;
