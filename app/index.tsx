import { useRouter } from "expo-router";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../lib/firebase";
import { clearLogin, getLogin } from "../lib/mmkv";

export default function Home() {
  const router = useRouter();
  const storedUser = getLogin();
  const [authUser, setAuthUser] = useState<any | null>(null);
  const [Mahasiswa, setMahasiswa] = useState<any[]>([]);
  const [autoLoginTried, setAutoLoginTried] = useState(false);

  // Jika ada kredensial tersimpan di MMKV tapi `authUser` belum ada,
  // coba re-login otomatis menggunakan email/password yang disimpan.
  useEffect(() => {
    let mounted = true;
    const tryRelogin = async () => {
      if (!storedUser || authUser || autoLoginTried) return;
      const { email, password } = storedUser as any;
      if (!email || !password) return;
      try {
        // Jangan console.log password
        const res = await signInWithEmailAndPassword(auth, email, password);
        if (mounted) {
          setAuthUser(res.user);
          console.log("Re-login successful (MMKV)");
        }
      } catch (e) {
        console.log("Re-login failed:", e);
      } finally {
        if (mounted) setAutoLoginTried(true);
      }
    };
    tryRelogin();
    return () => {
      mounted = false;
    };
  }, [storedUser, authUser, autoLoginTried]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setAuthUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (!authUser) return;

    let mounted = true;
    const fetchData = async () => {
      try {
        console.log("fetchData: authUser ->", authUser);
        console.log("fetchData: auth.currentUser ->", auth.currentUser);
        if (auth.currentUser && typeof auth.currentUser.getIdToken === "function") {
          try {
            const token = await auth.currentUser.getIdToken();
            console.log("fetchData: idToken length ->", token?.length ?? 0);
          } catch (tokErr) {
            console.log("fetchData: getIdToken error ->", tokErr);
          }
        }

        const snap = await getDocs(collection(db, "Mahasiswa"));
        console.log("fetchData: query snapshot ->", { empty: snap.empty, size: snap.size });
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (mounted) setMahasiswa(data as any[]);
      } catch (e: any) {
        console.log("Failed fetch mahasiswa:", e);
        console.log("Failed fetch mahasiswa - code:", e?.code, "message:", e?.message);
      }
    };
    fetchData();

    return () => {
      mounted = false;
    };
  }, [authUser]);

  const isAuthenticated = !!storedUser || !!authUser;

  useEffect(() => {
    if (!isAuthenticated) {
      const t = setTimeout(() => router.replace("/login"), 50);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Memeriksa sesi...</Text>
      </View>
    );
  }

  const displayUser = storedUser || authUser;

  const logout = async () => {
    clearLogin();
    if (authUser) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn("signOut failed", e);
      }
    }
    router.replace("/login");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Selamat datang informatics people</Text>
      <Text style={styles.email}>{displayUser?.email}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Firebase Session</Text>
        <View style={styles.line} />
        <Text style={styles.cardText}>UID: {displayUser?.uid}</Text>
        <Text style={styles.cardText}>Email: {displayUser?.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>MMKV Storage</Text>
        <View style={styles.line} />
        <Text style={styles.cardText}>
          {displayUser && Object.keys(displayUser).length > 0
            ? Object.entries(displayUser)
                .map(([key, val]) => `${key}: ${val}`)
                .join("\n")
            : ""}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Data Mahasiswa</Text>

      {Mahasiswa.length === 0 ? (
        <Text style={styles.loadingData}>Memuat data Mahasiswa...</Text>
      ) : (
        Mahasiswa.map((m) => (
          <View key={m.id} style={styles.listItem}>
            <Text style={styles.listTitle}>{m.Nama}</Text>
            <Text style={styles.listText}>NIM: {m.NIM}</Text>
            <Text style={styles.listText}>Jurusan: {m.Jurusan}</Text>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 22,
    paddingBottom: 100,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    fontSize: 16,
    opacity: 0.6,
  },

  header: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
  },

  email: {
    fontSize: 15,
    opacity: 0.7,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#0003",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },

  line: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 8,
  },

  cardText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },

  listItem: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#f0f5ff",
    marginBottom: 12,
  },

  listTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  listText: {
    fontSize: 14,
    opacity: 0.8,
  },

  loadingData: {
    textAlign: "center",
    opacity: 0.6,
  },

  logoutButton: {
    marginTop: 30,
    backgroundColor: "#ff4d4f",
    paddingVertical: 14,
    borderRadius: 12,
  },

  logoutText: {
    textAlign: "center",
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
