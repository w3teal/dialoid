import { signal, Text, View } from "nsh";
import { colors, font, fontFamily, spacing } from "./theme";

/** Reusable pressable with the shared skewed border style. */
export function DialoidButton(props: {
  label: string;
  vw: number;
  onPress: () => void;
  disabled?: boolean;
  activated?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}) {
  const hovered = signal(false);
  const isHovered = hovered();

  return (
    <View
      role="button"
      testID={props.testID}
      accessibilityLabel={props.accessibilityLabel ?? props.label}
      disabled={props.disabled}
      onPress={props.onPress}
      onMouseEnter={() => hovered.set(true)}
      onMouseLeave={() => hovered.set(false)}
      activeStyle={{ transform: "scale(0.95)" }}
      style={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: props.vw * spacing.buttonGap,
        backgroundColor: props.activated
          ? "rgba(255, 255, 255)"
          : "rgba(255, 255, 255, 0.22)",
        paddingHorizontal: props.vw * spacing.buttonPadding,
        paddingVertical: props.vw * spacing.buttonPadding,
        transitionProperty: "transform, background-color, color",
        transitionDuration: 100,
        opacity: props.disabled ? 0.5 : isHovered ? 0.85 : 1,
        cursor: props.disabled ? "not-allowed" : "pointer",
      }}
    >
      <Text
        style={{
          fontFamily,
          fontSize: props.vw * font.button.size,
          lineHeight: props.vw * font.button.lineHeight,
          color: props.activated ? colors.background : "rgba(255, 255, 255)",
          textAlign: "center",
        }}
      >
        {props.label}
      </Text>
    </View>
  );
}
