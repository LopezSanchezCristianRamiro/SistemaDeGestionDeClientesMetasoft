import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { useLogin } from "./hooks/useLogin";

export default function LoginScreen() {
  const router = useRouter();
  const { submitLogin, loading } = useLogin();
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [contrasenia, setContrasenia] = useState("");

  const handleSubmit = async () => {
    if (!nombreUsuario.trim() || !contrasenia.trim()) {
      Alert.alert("Campos requeridos", "Ingresa tu usuario y contraseña.");
      return;
    }

    const result = await submitLogin({
      nombreUsuario: nombreUsuario.trim(),
      contrasenia,
    });

    if (!result.success) {
      Alert.alert("Error de acceso", result.error);
      return;
    }

    router.replace("/catalogo");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="bg-surface"
      >
        <View className="flex-1 justify-center px-6 py-10">
          <View className="mb-8">
            <View className="self-start rounded-2xl bg-brand-primary px-4 py-2 mb-4">
              <ThemedText className="text-white font-bold text-sm">
                MetaSoft
              </ThemedText>
            </View>

            <ThemedText className="text-3xl font-extrabold text-surface-dark">
              Iniciar sesión
            </ThemedText>
            <ThemedText className="mt-2 text-base text-surface-dark/60">
              Accede al sistema de seguimiento y gestión de prospectos.
            </ThemedText>
          </View>

          <View className="rounded-3xl bg-white p-5 shadow-card">
            <View className="mb-4">
              <Text className="mb-2 text-sm font-semibold text-surface-dark">
                Usuario
              </Text>
              <TextInput
                value={nombreUsuario}
                onChangeText={setNombreUsuario}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Juan"
                placeholderTextColor="#9ca3af"
                className="rounded-2xl border border-surface-variant bg-white px-4 py-4 text-base text-surface-dark"
              />
            </View>

            <View className="mb-6">
              <Text className="mb-2 text-sm font-semibold text-surface-dark">
                Contraseña
              </Text>
              <TextInput
                value={contrasenia}
                onChangeText={setContrasenia}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                className="rounded-2xl border border-surface-variant bg-white px-4 py-4 text-base text-surface-dark"
              />
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className={`items-center justify-center rounded-2xl py-4 ${
                loading ? "bg-brand-dark/70" : "bg-brand-primary"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-bold text-white">
                  Entrar
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}