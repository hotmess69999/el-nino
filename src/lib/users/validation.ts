const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;
export const MAX_BIO_LENGTH = 280;
export const MAX_DISPLAY_NAME_LENGTH = 60;

/** Lowercase, trim — usernames are case-insensitive in this app. */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

export interface ProfileEditInput {
  displayName: string;
  bio: string;
}

export type ProfileValidationResult =
  | { ok: true; value: ProfileEditInput }
  | { ok: false; errors: Record<string, string> };

export function validateProfileEdit(input: Record<string, unknown>): ProfileValidationResult {
  const errors: Record<string, string> = {};

  const displayName = typeof input["displayName"] === "string" ? input["displayName"].trim() : "";
  if (!displayName) errors["displayName"] = "Display name is required.";
  else if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    errors["displayName"] = `Display name must be ${MAX_DISPLAY_NAME_LENGTH} characters or fewer.`;
  }

  const bio = typeof input["bio"] === "string" ? input["bio"].trim() : "";
  if (bio.length > MAX_BIO_LENGTH) errors["bio"] = `Bio must be ${MAX_BIO_LENGTH} characters or fewer.`;

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { displayName, bio } };
}
