"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useState, useTransition } from "react";
import { submitContactForm } from "@/actions/contact";
import {
  CONTACT_EMAIL,
  CONTACT_FORM_HEADING,
  CONTACT_FORM_HELPER,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
} from "@/content/contact-page";
import {
  contactFormSchema,
  flattenContactErrors,
  type ContactFieldErrors,
} from "@/lib/validations/contact";
import { ContactSocialLinks } from "./ContactSocialLinks";
import { ContactUnderlineField } from "./ContactUnderlineField";

export function ContactFormPanel() {
  const reduceMotion = useReducedMotion();
  const [isPending, startTransition] = useTransition();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

      const clientParsed = contactFormSchema.safeParse(payload);
      if (!clientParsed.success) {
        setFieldErrors(flattenContactErrors(clientParsed.error));
        setFormError("Lütfen formu kontrol edin.");
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
    [email, firstName, honeypot, lastName, message],
  );

  return (
    <motion.div
      className="flex flex-col px-4 sm:px-6 md:border-x md:border-border/60 md:px-7"
      initial={reduceMotion ? false : { opacity: 0, x: 44 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.88, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="space-y-1 border-b border-border/60 pb-8">
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/45">
          İletişim
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
          {CONTACT_FORM_HEADING}
        </p>
        <p className="mt-2 max-w-md text-[0.8125rem] leading-relaxed text-primary/55">
          {CONTACT_FORM_HELPER}
        </p>
      </div>

      <form className="relative mt-8 space-y-9" onSubmit={onSubmit} noValidate>
        <div className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0" aria-hidden>
          <label htmlFor="contact-company">Şirket</label>
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
            label="Ad"
            autoComplete="given-name"
            value={firstName}
            onChange={setFirstName}
            error={firstErr}
          />
          <ContactUnderlineField
            id="lastName"
            name="lastName"
            label="Soyad"
            autoComplete="family-name"
            value={lastName}
            onChange={setLastName}
            error={lastErr}
          />
        </div>

        <ContactUnderlineField
          id="email"
          name="email"
          label="E-posta"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          error={emailErr}
        />

        <ContactUnderlineField
          id="message"
          name="message"
          label="Mesaj"
          as="textarea"
          rows={6}
          value={message}
          onChange={setMessage}
          error={messageErr}
        />

        {formError ? (
          <p className="text-sm text-red-600/90" role="alert">
            {formError}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm text-primary/70" role="status">
            {success}
          </p>
        ) : null}

        <motion.button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary py-4 font-display text-sm font-semibold uppercase tracking-[0.2em] text-surface transition-[box-shadow,transform,opacity] hover:shadow-[0_12px_40px_-8px_rgb(15_23_42/0.35)] disabled:cursor-not-allowed disabled:opacity-55"
          whileHover={reduceMotion || isPending ? undefined : { scale: 1.01 }}
          whileTap={reduceMotion || isPending ? undefined : { scale: 0.995 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {isPending ? "Gönderiliyor…" : "Gönder"}
        </motion.button>
      </form>
    </motion.div>
  );
}
