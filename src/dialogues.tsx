import {
  computed,
  createMotion,
  signal,
  Text,
  View,
  type Accessor,
} from "nsh";
import type { RenderedDialogue } from "./parser";
import { colors, fontFamily } from "./theme";

const POP_IN_DURATION_MS = 500;
const SPEAKER_RULE_DURATION_MS = 1500;

const POP_IN = {
  duration: POP_IN_DURATION_MS,
  keyframes: {
    opacity: [
      { offset: 0, value: 0 },
      { offset: 0.5, value: 1 },
      { offset: 1, value: 1 },
    ],
    scale: [
      { offset: 0, value: 0 },
      { offset: 0.5, value: 1.05 },
      { offset: 1, value: 1 },
    ],
    rotate: [
      { offset: 0, value: 25 },
      { offset: 0.5, value: 0 },
      { offset: 1, value: 0 },
    ],
  },
};

export type DialogueReveal = {
  /** Visible message count per dialogue, derived from the reveal count. */
  revealedMessageCounts: Accessor<number[]>;
  /** Whether there is another message left to reveal. */
  hasMoreMessages: Accessor<boolean>;
  revealNextMessage: () => void;
};

/**
 * Tracks the reveal position as one count of visible messages. Per-dialogue
 * counts are derived from it, so the two representations cannot drift apart.
 * The first message is visible as soon as the game page is created.
 */
export function createDialogueReveal(
  dialogues: RenderedDialogue[],
): DialogueReveal {
  const totalMessages = dialogues.reduce(
    (total, dialogue) => total + dialogue.messages.length,
    0,
  );
  const revealedCount = signal(Math.min(1, totalMessages));

  const revealedMessageCounts = computed(() => {
    let remaining = revealedCount();
    return dialogues.map((dialogue) => {
      const revealed = Math.min(remaining, dialogue.messages.length);
      remaining -= revealed;
      return revealed;
    });
  });

  const hasMoreMessages = computed(() => revealedCount() < totalMessages);

  const revealNextMessage = () => {
    revealedCount.update((count) => Math.min(count + 1, totalMessages));
  };

  return { revealedMessageCounts, hasMoreMessages, revealNextMessage };
}

/** Message text with a scale/rotate entrance from the top-left anchor. */
function AnimatedMessage(props: { content: string; vw: number }) {
  const motion = createMotion({ enter: POP_IN });

  return (
    <Text
      style={{
        fontFamily,
        fontWeight: 800,
        fontSize: props.vw * 2.75,
        lineHeight: props.vw * 2.75 * 1.25,
        color: colors.text,
        transformOrigin: "top left",
        ...motion.style,
      }}
    >
      {props.content}
    </Text>
  );
}

/** Speaker row whose trailing rule animates its horizontal scale from 0 to 1. */
function Speaker(props: { name: string; vw: number }) {
  const motion = createMotion({ enter: POP_IN });
  const line = createMotion({
    enter: {
      duration: SPEAKER_RULE_DURATION_MS,
      keyframes: { scaleX: [0, 1] },
    },
  });

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: props.vw * 2,
        transformOrigin: "top left",
        ...motion.style,
      }}
    >
      <Text
        style={{
          fontFamily,
          fontSize: props.vw * 2,
          lineHeight: props.vw * 2.5,
          color: colors.text,
        }}
      >
        {props.name}
      </Text>
      <View
        style={{
          flex: 1,
          height: Math.max(1, props.vw * 0.15),
          backgroundColor: colors.text,
          transformOrigin: "left center",
          transform: line.transform,
        }}
      />
    </View>
  );
}

export function DialogueView(props: {
  dialogue: RenderedDialogue;
  index: number;
  revealedMessageCounts: Accessor<number[]>;
  vw: number;
}) {
  return (
    <If when={props.revealedMessageCounts()[props.index] > 0}>
      <View
        testID={`dialogue-${props.index}`}
        style={{ gap: props.vw * 2, width: "100%" }}
      >
        <Speaker name={props.dialogue.speaker} vw={props.vw} />
        <Each of={props.dialogue.messages} key="index">
          {(message, index) => (
            <If when={index() < props.revealedMessageCounts()[props.index]}>
              <AnimatedMessage content={message()} vw={props.vw} />
            </If>
          )}
        </Each>
      </View>
    </If>
  );
}
