export function insertToken(value: string, start: number, end: number, token: string) {
  const text = `{${token}}`;
  return { value: value.slice(0, start) + text + value.slice(end), caret: start + text.length };
}
