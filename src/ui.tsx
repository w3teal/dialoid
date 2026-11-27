import { signal, Text, View } from "nsh";
import { colors, fontFamily } from "./theme";

/** Reusable pressable with the shared skewed border style. */
export function DialoidButton(props: {
  label: string;
  vw: number;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}) {
  const hovered = signal(false);
  const isHovered = hovered();
  const highlighted = !props.disabled && isHovered;

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
        gap: props.vw * 0.25,
        backgroundColor: highlighted ? colors.accent : colors.background,
        borderWidth: props.vw * 0.25,
        borderColor: colors.accent,
        paddingHorizontal: props.vw * 0.5,
        paddingVertical: props.vw * 0.5,
        transitionProperty: "transform, background-color, color",
        transitionDuration: 100,
        opacity: props.disabled ? 0.5 : 1,
        cursor: props.disabled ? "not-allowed" : "pointer",
      }}
    >
      <Text
        style={{
          fontFamily,
          fontSize: props.vw * 2,
          lineHeight: props.vw * 2.5,
          color: highlighted ? colors.background : colors.accent,
          textAlign: "center",
        }}
      >
        {props.label}
      </Text>
    </View>
  );
}
