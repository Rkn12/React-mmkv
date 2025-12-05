// Membuat instance MMKV storage
import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV();

// Ambil session user dari MMKV
export const getLogin = () => {
  const raw = storage.getString("user");
  return raw && raw !== "" ? JSON.parse(raw) : null;
};

// Simpan session user
export const setLogin = (data: any) => {
  storage.set("user", JSON.stringify(data));
};

// Hapus session user
export const clearLogin = () => {
  const s = storage as any;

  // Coba beberapa metode MMKV karena tiap platform beda
  if (typeof s.delete === "function") return s.delete("user");
  if (typeof s.removeItem === "function") return s.removeItem("user");

  try {
    s.set("user", "");
  } catch (e) {
    console.warn("clearLogin: unable to remove MMKV key 'user'", e);
  }
};

export default storage;
