import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../components/ThemedText";
import { useLogin } from "./hooks/useLogin";

export default function LoginScreen() {
  const router = useRouter();
  const { submitLogin, loading } = useLogin();
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!nombreUsuario.trim() || !contrasenia.trim()) {
      Toast.show({
        type: "error",
        text1: "Campos requeridos",
        text2: "Ingresa tu usuario y contraseña.",
      });
      return;
    }

    const result = await submitLogin({
      nombreUsuario: nombreUsuario.trim(),
      contrasenia,
    });

    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "Error de acceso",
        text2: result.error,
      });
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
        <View className="flex-1 justify-center items-center px-6 py-10">
          {/* Contenedor centrado con ancho estándar (especialmente en web) */}
          <View className="w-full max-w-[440px]">
            <View className="mb-8 w-full">
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

            <View className="w-full rounded-3xl bg-white p-5 shadow-card">
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-surface-dark">
                  Usuario
                </Text>
                <TextInput
                  value={nombreUsuario}
                  onChangeText={setNombreUsuario}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  autoComplete="off"
                  textContentType="none"
                  importantForAutofill="no"
                  placeholder="Usuario"
                  placeholderTextColor="#9ca3af"
                  className="rounded-2xl border border-surface-variant bg-white px-4 py-4 text-base text-surface-dark"
                />
              </View>

              <View className="mb-6">
                <Text className="mb-2 text-sm font-semibold text-surface-dark">
                  Contraseña
                </Text>
                <View className="flex-row items-center rounded-2xl border border-surface-variant bg-white px-4">
                  <TextInput
                    value={contrasenia}
                    onChangeText={setContrasenia}
                    secureTextEntry={!showPassword}
                    autoComplete="off"
                    textContentType="none"
                    importantForAutofill="no"
                    placeholder="••••••••"
                    placeholderTextColor="#9ca3af"
                    className="flex-1 py-4 text-base text-surface-dark"
                  />
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    className="pl-3 py-2"
                  >
                    <Feather
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#6b7280"
                    />
                  </Pressable>
                </View>
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
                  <Text className="text-base font-bold text-white">Entrar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}