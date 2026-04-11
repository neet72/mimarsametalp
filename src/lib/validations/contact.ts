import { z } from "zod";

/** İletişim formu — client ve server’da aynı şema */
export const contactFormSchema = z.object({
  firstName: z.string().trim().min(1, "Ad gerekli").max(80),
  lastName: z.string().trim().min(1, "Soyad gerekli").max(80),
  email: z.string().trim().email("Geçerli bir e-posta girin").max(320),
  message: z.string().trim().min(10, "Mesaj en az 10 karakter olmalı").max(5000),
  company: z.string().trim().max(120).optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export type ContactFieldErrors = Partial<
  Record<keyof Pick<ContactFormInput, "firstName" | "lastName" | "email" | "message">, string[]>
>;

export function flattenContactErrors(
  error: z.ZodError<ContactFormInput>,
): ContactFieldErrors {
  const flat = error.flatten().fieldErrors;
  return {
    firstName: flat.firstName,
    lastName: flat.lastName,
    email: flat.email,
    message: flat.message,
  };
}
