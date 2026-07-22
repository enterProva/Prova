import type { LessonCategory, LessonStatus, PauseNudgeType } from "@/types/api";

export type NudgeTemplate = {
  detail: string;
  prompt: string;
  type: PauseNudgeType;
};

export type LessonDefinition = {
  category: LessonCategory;
  description: string;
  lessonId: string;
  lessonTitle: string;
  starterStatus: LessonStatus;
  steps: string[];
  tip: string;
};

export const NUDGE_LIBRARY: NudgeTemplate[] = [
  {
    prompt: "Have you read beyond the headline?",
    detail: "A quick skim can hide missing context. Read the body before you react or repost.",
    type: "reading",
  },
  {
    prompt: "How is this post making you feel right now?",
    detail: "Strong emotions can be a signal to slow down and verify before sharing.",
    type: "emotional",
  },
  {
    prompt: "Can you name the source behind this claim?",
    detail: "If the source is vague, anonymous, or impossible to trace, that is useful evidence.",
    type: "source",
  },
  {
    prompt: "What context might be missing from this story?",
    detail: "Publication date, location, and what happened before or after can change the meaning.",
    type: "context",
  },
  {
    prompt: "Would you be comfortable explaining why this is trustworthy?",
    detail: "A short explanation can reveal whether you actually have enough evidence.",
    type: "source",
  },
  {
    prompt: "If a friend sent you this, what would you fact-check first?",
    detail: "Naming the first verification step makes it easier to pause instead of react.",
    type: "context",
  },
];

export const LESSON_LIBRARY: LessonDefinition[] = [
  {
    lessonId: "cross-reference-sources",
    lessonTitle: "Cross-Reference Sources",
    category: "basics",
    starterStatus: "available",
    description: "Compare the same story across outlets to spot gaps, copied claims, and missing evidence.",
    steps: [
      "Open at least two independent sources covering the same claim.",
      "Check whether they point to original documents, witnesses, or reporting.",
      "Write down what is confirmed by both sources and what only appears once.",
    ],
    tip: "Agreement on specifics matters more than repeated headlines.",
  },
  {
    lessonId: "check-publication-date",
    lessonTitle: "Check Publication Date",
    category: "basics",
    starterStatus: "locked",
    description: "Old stories and recycled screenshots often spread as if they happened today.",
    steps: [
      "Find the original publication date, not just the repost date.",
      "Look for updates, corrections, or newer reporting on the same event.",
      "Ask whether timing changes the meaning of the claim.",
    ],
    tip: "Context breaks when time is stripped away.",
  },
  {
    lessonId: "verify-primary-evidence",
    lessonTitle: "Verify with Primary Evidence",
    category: "advanced",
    starterStatus: "locked",
    description: "Work backward from the summary to the actual document, interview, or data source.",
    steps: [
      "Identify the first-hand source behind the claim.",
      "Check whether the quote, image, or stat matches the original record.",
      "Note any details that were cropped, edited, or removed in the retelling.",
    ],
    tip: "Primary evidence is where misleading summaries often fall apart.",
  },
  {
    lessonId: "summarize-in-your-own-words",
    lessonTitle: "Summarize in Your Own Words",
    category: "advanced",
    starterStatus: "locked",
    description: "If you cannot explain it simply, you may not understand it well enough to share it.",
    steps: [
      "Describe the claim in one sentence without copying the headline.",
      "List the strongest piece of evidence supporting it.",
      "List one question you still cannot answer from the article alone.",
    ],
    tip: "A clear summary reveals missing understanding fast.",
  },
];

export const LESSON_TIPS = LESSON_LIBRARY.map((lesson) => lesson.tip);
