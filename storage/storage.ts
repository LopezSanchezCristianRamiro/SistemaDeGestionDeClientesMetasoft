import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

const storage = {
  getItem: (key: string) => {
    if (isWeb) {
      return Promise.resolve(localStorage.getItem(key));
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (isWeb) {
      localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (isWeb) {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
    return AsyncStorage.removeItem(key);
  },
};

export const saveToken = (token: string) => storage.setItem("token", token);

export const getToken = () => storage.getItem("token");

export const removeToken = () => storage.removeItem("token");

export const saveUsuarioId = (id: string) => storage.setItem("usuarioId", id);

export const getUsuarioId = () => storage.getItem("usuarioId");

export const saveEmail = (email: string) => storage.setItem("email", email);

export const getEmail = () => storage.getItem("email");

export const removeEmail = () => storage.removeItem("email");
