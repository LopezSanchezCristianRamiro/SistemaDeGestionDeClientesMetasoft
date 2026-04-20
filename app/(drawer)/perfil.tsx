import { clearStorage, getUsuarioData } from "@/storage/storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "../../components/ThemedText";

type UsuarioData = {
  nombreUsuario: string;
  nombres: string;
  apellido: string;
  correo: string;
  rol: string;
};

export default function PerfilScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [usuario, setUsuario] = useState<UsuarioData | null>(null);

  const loadUsuario = async () => {
    const data = await getUsuarioData();
    setUsuario(data);
  };

  useEffect(() => {
    loadUsuario();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsuario();
    }, []),
  );

  const handleLogout = async () => {
    await clearStorage();
    router.replace("/");
  };

  if (!usuario) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#E1007E" />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-surface"
      style={{ paddingTop: insets.top + 16 }}
    >
      {/* Avatar y nombre */}
      <View className="items-center px-6 pt-8 pb-6">
        <View className="w-20 h-20 rounded-full bg-brand-primary items-center justify-center mb-4">
          <ThemedText className="text-3xl font-extrabold text-white">
            {usuario.nombres.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText className="text-2xl font-extrabold text-surface-dark">
          {usuario.nombres} {usuario.apellido}
        </ThemedText>
        <ThemedText className="text-sm text-surface-dark/50 font-medium mt-1">
          {usuario.rol}
        </ThemedText>
      </View>

      {/* Info personal */}
      <View className="mx-6 rounded-3xl bg-white p-5 shadow-card gap-4">
        <InfoRow
          icon="person-outline"
          label="Usuario"
          value={usuario.nombreUsuario}
        />
        <View className="h-px bg-surface-variant/20" />
        <InfoRow
          icon="mail-outline"
          label="Correo"
          value={usuario.correo}
        />
        <View className="h-px bg-surface-variant/20" />
        <InfoRow
          icon="shield-outline"
          label="Rol"
          value={usuario.rol}
        />
        <View className="h-px bg-surface-variant/20" />
        <InfoRow
          icon="phone-portrait-outline"
          label="App"
          value="Versión 1.0.4"
        />
      </View>

      {/* Botón logout */}
      <View className="mx-6 mt-4">
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center justify-center gap-3 bg-red-50 rounded-2xl py-4"
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <ThemedText className="text-base font-bold text-red-500">
            Cerrar sesión
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="w-8 h-8 rounded-xl bg-surface-variant/20 items-center justify-center">
        <Ionicons name={icon} size={16} color="#6b7280" />
      </View>
      <View className="flex-1">
        <ThemedText className="text-xs text-surface-dark/40 font-medium">
          {label}
        </ThemedText>
        <ThemedText className="text-sm font-semibold text-surface-dark">
          {value}
        </ThemedText>
      </View>
    </View>
  );
}