export type TextNode = {
  type: "text";
  content: string;
};

export type DialogueNode = {
  type: "dialogue";
  speaker: string;
  message: string;
};

export type DialogueGroupNode = {
  type: "dialogueGroup";
  speaker: string;
  message: { children: TextNode[] };
};

export type DialoidNode = TextNode | DialogueNode | DialogueGroupNode;

export type RenderedDialogue = {
  key: string;
  speaker: string;
  messages: string[];
};

/**
 * Projects parsed nodes into speaker/message records for the view tree.
 * Plain text nodes are discarded because only dialogue nodes carry a speaker;
 * empty dialogues are removed so the reveal cursor never sees a zero-message group.
 */
export const toDialogues = (nodes: DialoidNode[]): RenderedDialogue[] => {
  const dialogues: RenderedDialogue[] = [];

  for (const node of nodes) {
    if (node.type === "dialogue") {
      dialogues.push({
        key: `dialogue-${dialogues.length}`,
        speaker: node.speaker,
        messages: node.message ? [node.message] : [],
      });
      continue;
    }

    if (node.type === "dialogueGroup") {
      dialogues.push({
        key: `dialogue-${dialogues.length}`,
        speaker: node.speaker,
        messages: node.message.children.map((child) => child.content),
      });
    }
  }

  // Empty groups have no revealable rows, so exclude them from the cursor.
  return dialogues.filter((dialogue) => dialogue.messages.length > 0);
};

/**
 * Line-oriented parser. Each trimmed line is classified as a group opener
 * (`speaker => ::`), a single message (`speaker => text`), or plain text.
 * Backslash sequences in dialogue fields are collapsed to their next character;
 * group bodies are accumulated until a standalone `::` terminator.
 */
export const parser = (text: string): DialoidNode[] => {
  const parseDialogueLine = (line: string) => {
    const separatorPosition = line.indexOf("=>");

    return {
      speaker: line.slice(0, separatorPosition).trim(),
      message: line.slice(separatorPosition + 2).trim(),
    };
  };

  const unescapeText = (value: string) => value.replace(/\\(.)/gs, "$1");

  const lines = text.trim().split("\n");
  const nodes: DialoidNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index++;
      continue;
    }

    if (line.includes("=>") && parseDialogueLine(line).message === "::") {
      const { speaker } = parseDialogueLine(line);
      const children: TextNode[] = [];
      let nextIndex = index + 1;

      while (nextIndex < lines.length && lines[nextIndex].trim() !== "::") {
        const content = unescapeText(lines[nextIndex].trim());

        if (content) {
          children.push({ type: "text", content });
        }

        nextIndex++;
      }

      if (nextIndex === lines.length) {
        throw new Error(`Unclosed dialogue group for ${speaker}`);
      }

      nodes.push({
        type: "dialogueGroup",
        speaker,
        message: { children },
      });

      index = nextIndex + 1;
    } else if (line.includes("=>")) {
      const { speaker, message } = parseDialogueLine(line);

      nodes.push({
        type: "dialogue",
        speaker: unescapeText(speaker),
        message: unescapeText(message),
      });

      index++;
    } else {
      nodes.push({
        type: "text",
        content: line,
      });

      index++;
    }
  }

  return nodes;
};
