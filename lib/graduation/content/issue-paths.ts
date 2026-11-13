type IssueLike = { path: readonly PropertyKey[]; message: string };

export function issuesToFieldErrors(issues: readonly IssueLike[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const path = issue.path.map(String).join(".");
    errors[path] ??= issue.message;
  }
  return errors;
}
