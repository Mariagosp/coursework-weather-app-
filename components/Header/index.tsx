import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../shared/const/colors.js";
import { Ionicons } from "@expo/vector-icons";
import { useNetworkStatus } from "../../shared/hooks/index.js";

type Props = {
  title?: string;
  subtitle?: string;
};

export default function Header({
  title = "Weather",
  subtitle = "Your weather by location",
}: Props) {
  const insets = useSafeAreaInsets();
  const isConnected = useNetworkStatus();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </Text>
        </View>
      </View>
      <View style={styles.subTitleBlock}>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
        <Ionicons
          name={isConnected ? "wifi" : "cloud-offline"}
          color={COLORS.textSecondary}
          size={15}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassWhite,
    backgroundColor: COLORS.main,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerBadge: {
    backgroundColor: COLORS.glassWhite,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  subTitleBlock: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },
});
