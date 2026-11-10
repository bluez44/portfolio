import { z } from "zod";

const PHONE = /^\+?\d{8,15}$/;
const PHONE_SEPARATORS = /[\s.()-]/g;

export const isEmail = (value: string): boolean => z.email().safeParse(value).success;

/** Digits with an optional leading +, ignoring spaces, dots, dashes and parentheses. */
export const isPhone = (value: string): boolean => PHONE.test(value.replace(PHONE_SEPARATORS, ""));

export const isPhoneOrEmail = (value: string): boolean => isPhone(value) || isEmail(value);
