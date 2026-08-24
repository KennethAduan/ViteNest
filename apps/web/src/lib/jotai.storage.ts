import { createJSONStorage } from "jotai/utils";
import CryptoJS from "crypto-js";
import { env } from "@/config/env";

const ENCRYPTION_KEY = env.VITE_ENCRYPTION_KEY;
const isDevelopment = import.meta.env.NODE_ENV === "development";

export const jotaiStorage = createJSONStorage(() => {
  return {
    // fallow-ignore-next-line complexity
    getItem: (key) => {
      try {
        const item = localStorage.getItem(key);
        if (!item) {
          return null;
        }

        if (isDevelopment) {
          return item;
        }

        const decrypted = CryptoJS.AES.decrypt(item, ENCRYPTION_KEY);
        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

        if (!decryptedString) {
          console.warn(`Failed to decrypt item for key: ${key}`);
          return null;
        }

        return decryptedString;
      } catch (error) {
        console.error(`Error decrypting item for key: ${key}`, error);
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        if (isDevelopment) {
          localStorage.setItem(key, value);
          return;
        }

        const encrypted = CryptoJS.AES.encrypt(
          value,
          ENCRYPTION_KEY
        ).toString();
        localStorage.setItem(key, encrypted);
      } catch (error) {
        console.error(`Error encrypting item for key: ${key}`, error);
      }
    },
    removeItem: (key) => {
      localStorage.removeItem(key);
    },
  };
});
