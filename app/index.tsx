import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getToken } from "../storage/storage";

export default function Index() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const resolveRoute = async () => {
      const token = await getToken();
      if (!isMounted) return;

      router.replace(token ? "/catalogo" : "/login");
      setReady(true);
    };

    resolveRoute();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#E1007E" />
      </View>
    );
  }

  return null;
}
