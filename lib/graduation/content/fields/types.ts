export type CopySection = "gate" | "header" | "envelope" | "met" | "ends" | "rsvp" | "wishes" | "finale" | "narrator" | "misc" | "png";
export type CallVar = "name" | "n" | "calendar";
export type CopyFieldKind = "text" | "textarea" | "list";

export type CopyField = {
  key: string;
  section: CopySection;
  label: string;
  kind: CopyFieldKind;
  group?: string;
  call?: CallVar;
  optional?: true;
};
