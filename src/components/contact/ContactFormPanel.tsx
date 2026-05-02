"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useState, useTransition } from "react";
import { submitContactForm } from "@/actions/contact";
import {
  CONTACT_EMAIL,
  CONTACT_FORM_HEADING,
  CONTACT_FORM_HELPER,
  CONTACT_FORM_CLIENT_INVALID,
  CONTACT_FORM_HONEYPOT_LABEL,
  CONTACT_FORM_LABEL_EMAIL,
  CONTACT_FORM_LABEL_FIRST_NAME,
  CONTACT_FORM_LABEL_LAST_NAME,
  CONTACT_FORM_LABEL_MESSAGE,
  CONTACT_FORM_SECTION_KICKER,
  CONTACT_FORM_SUBMIT,
  CONTACT_FORM_SUBMIT_PENDING,
  CONTACT_FORM_WA_FALLBACK,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
} from "@/content/contact-page";
import {
  CONTACT_FORM_CLIENT_INVALID as CONTACT_FORM_CLIENT_INVALID_EN,
  CONTACT_FORM_HEADING as CONTACT_FORM_HEADING_EN,
  CONTACT_FORM_HELPER as CONTACT_FORM_HELPER_EN,
  CONTACT_FORM_HONEYPOT_LABEL as CONTACT_FORM_HONEYPOT_LABEL_EN,
  CONTACT_FORM_LABEL_EMAIL as CONTACT_FORM_LABEL_EMAIL_EN,
  CONTACT_FORM_LABEL_FIRST_NAME as CONTACT_FORM_LABEL_FIRST_NAME_EN,
  CONTACT_FORM_LABEL_LAST_NAME as CONTACT_FORM_LABEL_LAST_NAME_EN,
  CONTACT_FORM_LABEL_MESSAGE as CONTACT_FORM_LABEL_MESSAGE_EN,
  CONTACT_FORM_SECTION_KICKER as CONTACT_FORM_SECTION_KICKER_EN,
  CONTACT_FORM_SUBMIT as CONTACT_FORM_SUBMIT_EN,
  CONTACT_FORM_SUBMIT_PENDING as CONTACT_FORM_SUBMIT_PENDING_EN,
  CONTACT_FORM_WA_FALLBACK as CONTACT_FORM_WA_FALLBACK_EN,
} from "@/content/contact-page.en";
import {
  contactFormSchema,
  flattenContactErrors,
  type ContactFieldErrors,
} from "@/lib/validations/contact";
import { ContactSocialLinks } from "./ContactSocialLinks";
import { ContactUnderlineField } from "./ContactUnderlineField";
import { usePathname } from "next/navigation";
import { localeFromPathname } from "@/lib/locale";

export function ContactFormPanel() {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const isEn = locale === "en";
  const [isPending, startTransition] = useTransition();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    message: string;
  } | null>(null);

  const firstErr = fieldErrors.firstName?.[0];
  const lastErr = fieldErrors.lastName?.[0];
  const emailErr = fieldErrors.email?.[0];
  const messageErr = fieldErrors.message?.[0];

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      setSuccess(null);
      setFieldErrors({});

      const payload = {
        firstName,
        lastName,
        email,
        message,
        company: honeypot || undefined,
      };
      setLastPayload({ firstName, lastName, email, message });

      const clientParsed = contactFormSchema.safeParse(payload);
      if (!clientParsed.success) {
        setFieldErrors(flattenContactErrors(clientParsed.error));
        setFormError(isEn ? CONTACT_FORM_CLIENT_INVALID_EN : CONTACT_FORM_CLIENT_INVALID);
        return;
      }

      startTransition(async () => {
        const result = await submitContactForm(clientParsed.data);
        if (result.ok) {
          setSuccess(result.message);
          setFirstName("");
          setLastName("");
          setEmail("");
          setMessage("");
          return;
        }
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        setFormError(result.error);
      });
    },
    [email, firstName, honeypot, isEn, lastName, message],
  );

  return (
    <motion.div
      className="flex flex-col px-4 sm:px-6 md:border-x md:border-border/60 md:px-7"
      initial={reduceMotion ? false : { opacity: 0, x: 44 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.08 }}
      transition={{ duration: 0.88, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="space-y-1 border-b border-border/60 pb-8">
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/45">
          {isEn ? CONTACT_FORM_SECTION_KICKER_EN : CONTACT_FORM_SECTION_KICKER}
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="block font-display text-lg font-medium tracking-tight text-primary transition-colors hover:text-accent sm:text-xl"
        >
          {CONTACT_EMAIL}
        </a>
        <a
          href={`tel:${CONTACT_PHONE_TEL}`}
          className="mt-1 inline-block font-display text-base tracking-wide text-primary/75 transition-colors hover:text-primary sm:text-lg"
        >
          {CONTACT_PHONE_DISPLAY}
        </a>

        <ContactSocialLinks />
      </div>

      <div className="mt-10">
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/45">
          {isEn ? CONTACT_FORM_HEADING_EN : CONTACT_FORM_HEADING}
        </p>
        <p className="mt-2 max-w-md text-[0.8125rem] leading-relaxed text-primary/55">
          {isEn ? CONTACT_FORM_HELPER_EN : CONTACT_FORM_HELPER}
        </p>
      </div>

      <form className="relative mt-8 space-y-9" onSubmit={onSubmit} noValidate>
        <div className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0" aria-hidden>
          <label htmlFor="contact-company">
            {isEn ? CONTACT_FORM_HONEYPOT_LABEL_EN : CONTACT_FORM_HONEYPOT_LABEL}
          </label>
          <input
            id="contact-company"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div className="grid gap-9 sm:grid-cols-2">
          <ContactUnderlineField
            id="firstName"
            name="firstName"
            label={isEn ? CONTACT_FORM_LABEL_FIRST_NAME_EN : CONTACT_FORM_LABEL_FIRST_NAME}
            autoComplete="given-name"
            value={firstName}
            onChange={setFirstName}
            error={firstErr}
          />
          <ContactUnderlineField
            id="lastName"
            name="lastName"
            label={isEn ? CONTACT_FORM_LABEL_LAST_NAME_EN : CONTACT_FORM_LABEL_LAST_NAME}
            autoComplete="family-name"
            value={lastName}
            onChange={setLastName}
            error={lastErr}
          />
        </div>

        <ContactUnderlineField
          id="email"
          name="email"
          label={isEn ? CONTACT_FORM_LABEL_EMAIL_EN : CONTACT_FORM_LABEL_EMAIL}
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          error={emailErr}
        />

        <ContactUnderlineField
          id="message"
          name="message"
          label={isEn ? CONTACT_FORM_LABEL_MESSAGE_EN : CONTACT_FORM_LABEL_MESSAGE}
          as="textarea"
          rows={6}
          value={message}
          onChange={setMessage}
          error={messageErr}
        />

        {formError ? (
          <div
            className="rounded-xl border border-red-200/70 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            <p className="font-medium">{formError}</p>
            {lastPayload ? (
              <p className="mt-1 text-xs text-red-700/80">
                {(isEn ? CONTACT_FORM_WA_FALLBACK_EN : CONTACT_FORM_WA_FALLBACK)} {lastPayload.firstName}{" "}
                {lastPayload.lastName}
              </p>
            ) : null}
          </div>
        ) : null}
        {success ? (
          <div
            className="rounded-xl border border-border/70 bg-surface px-4 py-3 text-sm text-primary/75"
            role="status"
          >
            {success}
          </div>
        ) : null}

        <motion.button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary py-4 font-display text-sm font-semibold uppercase tracking-[0.2em] text-surface transition-[box-shadow,transform,opacity] hover:shadow-[0_12px_40px_-8px_rgb(15_23_42/0.35)] disabled:cursor-not-allowed disabled:opacity-55"
          whileHover={reduceMotion || isPending ? undefined : { scale: 1.01 }}
          whileTap={reduceMotion || isPending ? undefined : { scale: 0.995 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {isPending
            ? (isEn ? CONTACT_FORM_SUBMIT_PENDING_EN : CONTACT_FORM_SUBMIT_PENDING)
            : (isEn ? CONTACT_FORM_SUBMIT_EN : CONTACT_FORM_SUBMIT)}
        </motion.button>
      </form>
    </motion.div>
  );
}
