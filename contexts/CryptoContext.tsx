import React, { createContext, useState, useContext, ReactNode } from 'react';
import { deriveAndVerifyKey as deriveAndVerifyKeyUtil, encrypt as encryptUtil, decrypt as decryptUtil } from '../lib/crypto';

interface CryptoContextType {
  key: CryptoKey | null;
  setKey: (key: CryptoKey | null) => void;
  deriveAndVerifyKey: (password: string, userId: string) => Promise<CryptoKey | null>;
  encrypt: (key: CryptoKey, plaintext: string) => Promise<{ iv: string; data: string; }>;
  decrypt: (key: CryptoKey, ciphertext: string, iv: string) => Promise<string>;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

export const CryptoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [key, setKey] = useState<CryptoKey | null>(null);

  const value = {
    key,
    setKey,
    deriveAndVerifyKey: deriveAndVerifyKeyUtil,
    encrypt: encryptUtil,
    decrypt: decryptUtil,
  };

  return (
    <CryptoContext.Provider value={value}>
      {children}
    </CryptoContext.Provider>
  );
};

export const useCrypto = (): CryptoContextType => {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
};
