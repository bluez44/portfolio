import { z } from "zod";

export const DEFAULT_TRACK = "audio/underwater-city.mp3";

const AUDIO_PATHNAME_PATTERN = /^audio\/[A-Za-z0-9._-]+\.(mp3|m4a)$/;

export const isAudioPathname = (pathname: string): boolean => AUDIO_PATHNAME_PATTERN.test(pathname);

export const audioUrl = (pathname: string): string =>
  `/api/graduation/audio?pathname=${encodeURIComponent(pathname)}`;

export const trackPathnameSchema = z
  .string()
  .trim()
  .regex(AUDIO_PATHNAME_PATTERN, "Đường dẫn phải dạng audio/ten-file.mp3");
