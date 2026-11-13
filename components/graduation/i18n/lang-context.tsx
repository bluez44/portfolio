"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { resolveGraduationContent, type ResolvedContent } from "@/lib/graduation/content/resolve-content";
import type { GraduationSettingsContent, GuestContent } from "@/lib/graduation/content/settings-types";
import type { Lang } from "@/lib/graduation/i18n";
import { writeLangCookie } from "@/lib/graduation/i18n/lang-cookie";

type LangValue = ResolvedContent & { lang: Lang; guestId: string | null; setLang: (lang: Lang) => void };

type LangProviderProps = {
  initialLang: Lang;
  settings: GraduationSettingsContent;
  guest: GuestContent | null;
  guestId?: string | null;
  envPhone?: string | null;
  children: ReactNode;
};

const LangContext = createContext<LangValue | null>(null);

/** Cookie (not localStorage) so the server renders the chosen language without a flash. */
export function LangProvider({ initialLang, settings, guest, guestId = null, envPhone = null, children }: LangProviderProps) {
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

  const content = useMemo(() => resolveGraduationContent({ lang, settings, guest, envPhone }), [lang, settings, guest, envPhone]);

  return <LangContext.Provider value={{ ...content, lang, guestId, setLang }}>{children}</LangContext.Provider>;
}

export function useLang(): LangValue {
  const value = useContext(LangContext);
  if (!value) throw new Error("useLang must be used inside <LangProvider>");
  return value;
}

/** Shorthand for components that only read copy. */
export const useCopy = () => useLang().copy;

/** Event data with the guest's customizations applied. */
export const useGradEvent = () => useLang().event;

export const useOwner = () => useLang().owner;

export const useImages = () => useLang().images;
