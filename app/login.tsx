import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../lib/firebase";
import { setLogin } from "../lib/mmkv";

export default function Login() {
  const [email, setEmail] = useState("");
  const [realPassword, setRealPassword] = useState("");
  const [show, setShow] = useState(false);

  const displayValue = show ? realPassword : "•".repeat(realPassword.length);

  const handlePasswordChange = (text: string) => {
    if (text.length > realPassword.length) {
      const addedChar = text[text.length - 1];
      setRealPassword(realPassword + addedChar);
    } else {
      setRealPassword(realPassword.slice(0, -1));
    }
  };

  const login = async () => {
    try {
      const res = await signInWithEmailAndPassword(
        auth,
        email,
        realPassword
      );
      setLogin({ uid: res.user.uid, email: res.user.email, password: realPassword });
      router.replace("/");
    } catch (err) {
      console.log("LOGIN ERROR:", err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Selamat Datang</Text>
      <Text style={styles.subtitle}>Silakan masuk untuk melanjutkan</Text>

      {/* Card Box */}
      <View style={styles.card}>
        {/* Email Input */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Masukkan email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#999"
        />

        {/* Password Input */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            placeholder="Masukkan password"
            autoCapitalize="none"
            value={displayValue}
            onChangeText={handlePasswordChange}
            style={styles.input}
            placeholderTextColor="#999"
          />

          <TouchableOpacity onPress={() => setShow(!show)} style={styles.showBtn}>
            <Text style={{ color: "#4A90E2", fontWeight: "600" }}>
              {show ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity onPress={login} style={styles.button}>
          <Text style={styles.buttonText}>Masuk</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    paddingTop: 120,
    backgroundColor: "#F8FAFF",
    flexGrow: 1,
  },

  title: {
    fontSize: 33,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 5,
    color: "#1A1A1A",
  },

  subtitle: {
    textAlign: "center",
    fontSize: 15,
    color: "#666",
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#00000055",
    marginBottom: 20,
  },

  label: {
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
    color: "#333",
  },

  input: {
    borderWidth: 1,
    borderColor: "#C8D2E3",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F9FBFF",
    color: "#000",
  },

  passwordWrapper: {
    position: "relative",
  },

  showBtn: {
    position: "absolute",
    right: 12,
    top: 16,
  },

  button: {
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 30,
  },

  buttonText: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 17,
    color: "#FFF",
  },
});
