import { TourTarget } from "@/tour";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const profile = () => {
  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 20 }}>
      <Text>Profile screen</Text>

      <TourTarget id="profile.cta">
        <TouchableOpacity
          style={{
            marginTop: 20,
            paddingVertical: 15,
            backgroundColor: "black",
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Go to details
          </Text>
        </TouchableOpacity>
      </TourTarget>
    </SafeAreaView>
  );
};

export default profile;
