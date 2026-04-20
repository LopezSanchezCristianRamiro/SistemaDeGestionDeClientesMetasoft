
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../components/ThemedText";
import { useRegister } from "./hooks/useRegister";

const ROLES = [
  { label: "Azafata", value: 2 },
  { label: "Colaborador", value: 3 },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { submitRegister, loading } = useRegister();

  const [nombres, setNombres] = useState("");
  const [correoElectronico, setCorreoElectronico] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [contraseniaConfirmation, setContraseniaConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [idRol, setIdRol] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (
      !nombres.trim() ||
      !correoElectronico.trim() ||
      !nombreUsuario.trim() ||
      !contrasenia.trim() ||
      !contraseniaConfirmation.trim()
    ) {
      Toast.show({
        type: "error",
        text1: "Campos requeridos",
        text2: "Por favor completa todos los campos.",
      });
      return;
    }

    if (!idRol) { 
      Toast.show({ type: "error", text1: "Selecciona un rol", text2: "Elige Azafata o Colaborador." });
      return;
    }

    if (contrasenia !== contraseniaConfirmation) {
      Toast.show({
        type: "error",
        text1: "Las contraseñas no coinciden",
        text2: "Verifica que ambas contraseñas sean iguales.",
      });
      return;
    }

    const result = await submitRegister({
      nombres: nombres.trim(),
      correoElectronico: correoElectronico.trim(),
      nombreUsuario: nombreUsuario.trim(),
      contrasenia,
      contrasenia_confirmation: contraseniaConfirmation,
      idRol: 2,
    });

    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "Error al registrarse",
        text2: result.error,
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "¡Registro exitoso!",
      text2: "Tu cuenta fue creada. Ahora puedes iniciar sesión.",
    });

    setTimeout(() => router.replace("/(auth)/login"), 1500);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
        <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={20}
            className="bg-surface"
        >
        <View className="flex-1 justify-center items-center px-6 py-10">
          <View className="w-full max-w-[440px]">

            {/* Header */}
            <View className="mb-8 w-full">
              <View className="self-start rounded-2xl bg-brand-primary px-4 py-2 mb-4">
                <ThemedText className="text-white font-bold text-sm">
                  MetaSoft
                </ThemedText>
              </View>
              <ThemedText className="text-3xl font-extrabold text-surface-dark">
                Crear Cuenta
              </ThemedText>
              <ThemedText className="mt-2 text-base text-surface-dark/60">
                Completa tus datos para comenzar la experiencia.
              </ThemedText>
            </View>

            {/* Card */}
            <View className="w-full rounded-3xl bg-white p-5 shadow-card">

              {/* Nombre completo */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-surface-dark">
                  Nombre Completo
                </Text>
                <TextInput
                  value={nombres}
                  onChangeText={setNombres}
                  autoCapitalize="words"
                  placeholder="John Doe"
                  placeholderTextColor="#9ca3af"
                  className="rounded-2xl border border-surface-variant bg-white px-4 py-4 text-base text-surface-dark"
                />
              </View>

              {/* Correo */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-surface-dark">
                  Correo Electrónico
                </Text>
                <TextInput
                  value={correoElectronico}
                  onChangeText={setCorreoElectronico}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="nombre@empresa.com"
                  placeholderTextColor="#9ca3af"
                  className="rounded-2xl border border-surface-variant bg-white px-4 py-4 text-base text-surface-dark"
                />
              </View>

              {/* Usuario */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-surface-dark">
                  Nombre de Usuario
                </Text>
                <TextInput
                  value={nombreUsuario}
                  onChangeText={setNombreUsuario}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="usuario.ejemplo"
                  placeholderTextColor="#9ca3af"
                  className="rounded-2xl border border-surface-variant bg-white px-4 py-4 text-base text-surface-dark"
                />
              </View>
              {/* Selector de Rol ← NUEVO */}
                <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-surface-dark">Rol</Text>
                <View style={{ flexDirection: "row", gap: 12 }}>
                    {ROLES.map((rol) => (
                    <Pressable
                        key={rol.value}
                        onPress={() => setIdRol(rol.value)}
                        style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 16,
                        borderWidth: 1.5,
                        paddingVertical: 16,
                        borderColor: idRol === rol.value ? "#6366f1" : "#e5e7eb",
                        backgroundColor: idRol === rol.value ? "#6366f1" : "#ffffff",
                        }}
                    >
                        <Text
                        style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: idRol === rol.value ? "#ffffff" : "#111827",
                        }}
                        >
                        {rol.label}
                        </Text>
                    </Pressable>
                    ))}
                </View>
                </View>

              {/* Contraseña */}
              <View className="mb-4">
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
                    onPress={() => setShowPassword((p) => !p)}
                    hitSlop={10}
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

              {/* Confirmar contraseña */}
              <View className="mb-6">
                <Text className="mb-2 text-sm font-semibold text-surface-dark">
                  Confirmar Contraseña
                </Text>
                <View className="flex-row items-center rounded-2xl border border-surface-variant bg-white px-4">
                  <TextInput
                    value={contraseniaConfirmation}
                    onChangeText={setContraseniaConfirmation}
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="off"
                    textContentType="none"
                    importantForAutofill="no"
                    placeholder="••••••••"
                    placeholderTextColor="#9ca3af"
                    className="flex-1 py-4 text-base text-surface-dark"
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword((p) => !p)}
                    hitSlop={10}
                    className="pl-3 py-2"
                  >
                    <Feather
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#6b7280"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Botón */}
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
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base font-bold text-white">
                      Registrarse
                    </Text>
                    <Feather name="arrow-right" size={18} color="#fff" />
                  </View>
                )}
              </Pressable>

              {/* Link a login */}
              <View className="flex-row justify-center mt-5">
                <Text className="text-sm text-surface-dark/60">
                  ¿Ya tienes cuenta?{" "}
                </Text>
                <Pressable onPress={() => router.push("/(auth)/login")}>
                  <Text className="text-sm font-bold text-brand-primary">
                    Iniciar sesión
                  </Text>
                </Pressable>
              </View>

            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
}