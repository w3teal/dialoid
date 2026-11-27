import { Image, Scroll, View, type ViewRef } from "nsh";
import baseImage from "../assets/base.png";
import { createDialogueReveal, DialogueView } from "./dialogues";
import type { RenderedDialogue } from "./parser";
import { colors, IMAGE_ASPECT } from "./theme";
import { DialoidButton } from "./ui";

export function GamePage(props: {
  dialogues: RenderedDialogue[];
  vw: number;
}) {
  const { revealedMessageCounts, hasMoreMessages, revealNextMessage } =
    createDialogueReveal(props.dialogues);
  let bottomAnchor: ViewRef | undefined;

  const handleContinuePress = () => {
    revealNextMessage();
    bottomAnchor?.reveal({ vertical: "end", animated: true });
  };

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
      <View
        style={{
          height: "100%",
          aspectRatio: IMAGE_ASPECT,
          flexShrink: 0,
          justifyContent: "center",
        }}
      >
        <Image
          testID="base-image"
          src={baseImage}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </View>
      <View
        style={{
          flex: 1,
          height: "100%",
          minWidth: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Scroll style={{ flex: 1 }}>
          <View
            style={{
              padding: props.vw * 3,
              gap: props.vw * 4,
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
            <View style={{ alignItems: "flex-start" }}>
              <DialoidButton
                label="Continue >"
                accessibilityLabel="Continue"
                vw={props.vw}
                testID="continue-button"
                disabled={!hasMoreMessages()}
                onPress={handleContinuePress}
              />
            </View>
            <View ref={bottomAnchor} />
          </View>
        </Scroll>
      </View>
    </View>
  );
}
