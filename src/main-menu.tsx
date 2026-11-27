import { Text, View } from "nsh";
import { colors, fontFamily } from "./theme";
import { DialoidButton } from "./ui";

export function MainMenu(props: {
  vw: number;
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
        padding: props.vw * 2,
      }}
    >
      <View>
        <Text
          testID="title"
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: props.vw * 5,
            lineHeight: props.vw * 6.25,
            marginVertical: props.vw * 3.35,
            color: colors.text,
          }}
        >
          Dialoid example
        </Text>
      </View>
      <View style={{ gap: props.vw, alignItems: "flex-start" }}>
        <DialoidButton
          label="Play"
          vw={props.vw}
          testID="play-button"
          disabled={props.disabled}
          onPress={props.onPlay}
        />
      </View>
    </View>
  );
}
