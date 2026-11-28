import { Text, View } from "nsh";
import {
  AUTO_SPEEDS,
  colors,
  font,
  fontFamily,
  spacing,
  type AutoSpeed,
} from "./theme";
import { DialoidButton } from "./ui";

export function MainMenu(props: {
  vw: number;
  autoSpeed: AutoSpeed;
  onAutoSpeedChange: (speed: AutoSpeed) => void;
  onPlay: () => void;
  disabled?: boolean;
}) {
  return (
    <View
      testID="main-menu"
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: colors.background,
        padding: props.vw * spacing.menuPadding,
      }}
    >
      <View>
        <Text
          testID="title"
          style={{
            fontFamily,
            fontWeight: font.title.weight,
            fontSize: props.vw * font.title.size,
            lineHeight: props.vw * font.title.lineHeight,
            marginVertical: props.vw * spacing.menuTitleMargin,
            color: colors.menuTitle,
          }}
        >
          Dialoid example
        </Text>
      </View>
      <View
        style={{ gap: props.vw * spacing.menuButtonGap, alignItems: "flex-start" }}
      >
        <DialoidButton
          label="Play"
          vw={props.vw}
          testID="play-button"
          disabled={props.disabled}
          onPress={props.onPlay}
        />
      </View>
      <View
        testID="settings"
        style={{
          marginTop: props.vw * spacing.menuButtonGap,
          gap: props.vw * spacing.buttonGroupGap,
        }}
      >
        <Text
          style={{
            fontFamily,
            color: colors.text,
          }}
        >
          Auto speed
        </Text>
        <View
          style={{
            flexDirection: "row",
            gap: props.vw * spacing.buttonGroupGap,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Each of={AUTO_SPEEDS} key={(speed) => speed.label}>
            {(speed) => (
              <View style={{ flex: 1 }}>
                <DialoidButton
                  label={speed().label}
                  vw={props.vw}
                  testID={`speed-${speed().label.toLowerCase()}`}
                  activated={speed().msPerWord === props.autoSpeed.msPerWord}
                  onPress={() => props.onAutoSpeedChange(speed())}
                />
              </View>
            )}
          </Each>
        </View>
      </View>
    </View>
  );
}
