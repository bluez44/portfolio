export type TemplateVars = Readonly<Record<string, string | undefined>>;

const TOKEN = /\{(\w+)\}/g;

export function fillTemplate(template: string, vars: TemplateVars): string {
  return template.replace(TOKEN, (_, name: string) => vars[name] ?? "");
}

export function templateTokens(template: string): string[] {
  return [...new Set(Array.from(template.matchAll(TOKEN), (match) => match[1]))];
}
