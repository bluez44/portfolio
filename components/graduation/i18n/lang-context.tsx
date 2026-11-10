"use client";

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
import { GRADUATION_COPY, type GraduationCopy, type Lang } from "@/lib/graduation/i18n";
import { GRADUATION_EVENT } from "@/lib/graduation/event";
import { writeLangCookie } from "@/lib/graduation/i18n/lang-cookie";
import { resolveInvitationCopy } from "@/lib/graduation/resolve-invitation-copy";
import type { GuestCustomContent } from "@/lib/graduation/types";

type LangValue = { lang: Lang; copy: GraduationCopy; setLang: (lang: Lang) => void };

const LangContext = createContext<LangValue | null>(null);

/** Cookie (not localStorage) so the server renders the chosen language without a flash. */
export function LangProvider({
  initialLang,
  customContent,
  children,
}: {
  initialLang: Lang;
  customContent?: GuestCustomContent | null;
  children: ReactNode;
}) {
  const [lang, setLangState] = useState(initialLang);

  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [lang]);

  const setLang = (next: Lang) => {
    writeLangCookie(next);
    setLangState(next);
  };

  const copy = useMemo(() => {
    const base = GRADUATION_COPY[lang];
    return resolveInvitationCopy(base, GRADUATION_EVENT, customContent).copy;
  }, [lang, customContent]);

  return <LangContext.Provider value={{ lang, copy, setLang }}>{children}</LangContext.Provider>;
}

export function useLang(): LangValue {
  const value = useContext(LangContext);
  if (!value) throw new Error("useLang must be used inside <LangProvider>");
  return value;
}

/** Shorthand for components that only read copy. */
export const useCopy = () => useLang().copy;
