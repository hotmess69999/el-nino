/** Pure/no-DB import — safe to import from client components. */
export const MODERATION_REASONS = [
  "off_topic",
  "false_context",
  "manipulated_media",
  "unsafe_personal_information",
  "harassment",
  "copyright",
  "illegal_content",
  "other",
] as const;
export type ModerationReason = (typeof MODERATION_REASONS)[number];
