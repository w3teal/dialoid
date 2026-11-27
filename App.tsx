import {
  createMotion,
  mount,
  resource,
  signal,
  Text,
  View,
  windowSize,
  type MotionSpec,
} from "nsh";
import { createNavStack, NavPage, NavStack } from "nsh/base";
import initScriptUrl from "./scripts/init.dloid?url";
import { GamePage } from "./src/game";
import { MainMenu } from "./src/main-menu";
import { parser, toDialogues } from "./src/parser";
import { colors, fontFamily, screenHeight, screenWidth, VIEW_ASPECT } from "./src/theme";

const nav = createNavStack(["root"]);

type Page = "menu" | "game";

const PAGE_FADE_MS = 220;
const FADE_OUT: MotionSpec = {
  duration: PAGE_FADE_MS,
  keyframes: { opacity: [1, 0] },
};
const FADE_IN: MotionSpec = {
  duration: PAGE_FADE_MS,
  keyframes: { opacity: [0, 1] },
};

/** Centered status text for the script's loading and error states. */
function StatusMessage(props: { vw: number; children: string }) {
  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        padding: props.vw * 3,
        justifyContent: "center",
      }}
    >
      <Text style={{ fontFamily, fontSize: props.vw * 2, color: colors.text }}>
        {props.children}
      </Text>
    </View>
  );
}

function App() {
  const page = signal<Page>("menu");
  const pageMotion = createMotion();
  const transitioning = signal(false);

  const transitionTo = async (next: Page) => {
    if (transitioning()) return;

    transitioning.set(true);
    try {
      await pageMotion.play(FADE_OUT);
      page.set(next);
      await pageMotion.play(FADE_IN);
    } finally {
      transitioning.set(false);
    }
  };

  const script = resource(async () => {
    const response = await fetch(initScriptUrl);

    if (!response.ok) {
      throw new Error(`Could not load init.dloid: ${response.status}`);
    }

    return toDialogues(parser(await response.text()));
  });

  const width = () => screenWidth(windowSize());
  const height = () => screenHeight(windowSize());
  const vw = () => width() / 100;

  return (
    <NavStack state={nav} style={{ flex: 1 }}>
      {() => (
        <NavPage
          headerVisible={false}
          statusBar={{ hidden: true }}
          ios={{ supportedOrientations: ["landscape"] }}
          android={{ supportedOrientations: ["landscape"] }}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.black,
              overflow: "hidden",
            }}
          >
            <View
              testID="dialoid-screen"
              style={{
                position: "relative",
                width: width(),
                height: height(),
                aspectRatio: VIEW_ASPECT,
                backgroundColor: colors.background,
                overflow: "hidden",
              }}
            >
              <View
                testID="page-transition"
                style={{ width: "100%", height: "100%", ...pageMotion.style }}
              >
                <If when={page() === "menu"}>
                  <MainMenu
                    vw={vw()}
                    disabled={transitioning()}
                    onPlay={() => void transitionTo("game")}
                  />
                </If>
                <If when={page() === "game"}>
                  <If when={script.error()}>
                    {(error) => (
                      <StatusMessage vw={vw()}>{String(error())}</StatusMessage>
                    )}
                  </If>
                  <If when={script.loading() && !script()}>
                    <StatusMessage vw={vw()}>Loading…</StatusMessage>
                  </If>
                  <If when={script()}>
                    {(dialogues) => (
                      <GamePage dialogues={dialogues()} vw={vw()} />
                    )}
                  </If>
                </If>
              </View>
            </View>
          </View>
        </NavPage>
      )}
    </NavStack>
  );
}

mount(App);
