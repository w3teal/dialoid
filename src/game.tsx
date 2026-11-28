import { effect, resource, Scroll, View, type ViewRef } from "nsh";
import { Canvas, sampleCanvasPalette } from "./canvas";
import { createDialogueReveal, DialogueView } from "./dialogues";
import { FALLBACK_PALETTE } from "./palette";
import type { RenderedDialogue } from "./parser";
import { colors, spacing } from "./theme";
import { DialoidButton } from "./ui";

export function GamePage(props: {
  dialogues: RenderedDialogue[];
  vw: number;
  autoMsPerWord: number;
  onMenu: () => void;
}) {
  const {
    revealedMessageCounts,
    revealedCount,
    hasMoreMessages,
    auto,
    toggleAuto,
    revealNextMessage,
  } = createDialogueReveal(props.dialogues, () => props.autoMsPerWord);
  const palette = resource(() => sampleCanvasPalette());
  let bottomAnchor: ViewRef | undefined;

  const dialogueBackground = () => {
    const [first, second, third] = palette() ?? FALLBACK_PALETTE;
    return `linear-gradient(160deg, ${first} 40%, ${second} 50%, ${third} 100%)`;
  };

  let mounted = false;
  effect(() => {
    revealedCount();
    if (!mounted) {
      mounted = true;
      return;
    }
    bottomAnchor?.reveal({ vertical: "end", animated: true });
  });

  return (
    <View
      testID="game-page"
      style={{
        width: "100%",
        height: "100%",
        flexDirection: "row",
        backgroundColor: colors.background,
        overflow: "hidden",
      }}
    >
      <Canvas />
      <View
        style={{
          flex: 1,
          height: "100%",
          minWidth: 0,
          position: "relative",
          overflow: "hidden",
          backgroundColor: colors.background,
          backgroundImage: dialogueBackground(),
        }}
      >
        <View
          testID="dialogue-overlay"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundImage: colors.dialogueOverlay,
            pointerEvents: "none",
          }}
        />
        <Scroll style={{ flex: 1, position: "relative", zIndex: 1 }}>
          <View
            style={{
              padding: props.vw * spacing.gamePadding,
              gap: props.vw * spacing.gameGap,
              flexGrow: 1,
              width: "100%",
            }}
          >
            <Each of={props.dialogues} key={(dialogue) => dialogue.key}>
              {(dialogue, index) => (
                <DialogueView
                  dialogue={dialogue()}
                  index={index()}
                  revealedMessageCounts={revealedMessageCounts}
                  vw={props.vw}
                />
              )}
            </Each>
            <View
              testID="dialogue-buttons"
              style={{
                flexDirection: "row",
                gap: props.vw * spacing.buttonGroupGap,
                width: "100%",
              }}
            >
              <View style={{ flex: 2 }}>
                <DialoidButton
                  label="Continue"
                  accessibilityLabel="Continue"
                  vw={props.vw}
                  testID="continue-button"
                  disabled={!hasMoreMessages()}
                  onPress={revealNextMessage}
                />
              </View>
              <View style={{ flex: 1 }}>
                <DialoidButton
                  label="Auto"
                  accessibilityLabel="Auto"
                  vw={props.vw}
                  testID="auto-button"
                  activated={auto()}
                  onPress={toggleAuto}
                />
              </View>
              <View style={{ flex: 1 }}>
                <DialoidButton
                  label="Menu"
                  accessibilityLabel="Menu"
                  vw={props.vw}
                  testID="menu-button"
                  onPress={() => {
                    if (auto()) toggleAuto();
                    props.onMenu();
                  }}
                />
              </View>
            </View>
            <View ref={bottomAnchor} />
          </View>
        </Scroll>
      </View>
    </View>
  );
}
