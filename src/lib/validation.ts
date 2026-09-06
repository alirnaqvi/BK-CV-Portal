import { z } from "zod";

export const cvFormSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the full name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  domain: z.string().trim().min(2, "Select or enter a field").max(80),
  experienceYears: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : Number(v)))
    .refine((v) => v === undefined || (Number.isFinite(v) && v >= 0 && v <= 60), {
      message: "Enter a realistic number of years",
    }),
  currentRole: z.string().trim().max(120).optional().or(z.literal("")),
  currentCompany: z.string().trim().max(120).optional().or(z.literal("")),
  education: z.string().trim().max(200).optional().or(z.literal("")),
  skills: z.string().trim().max(500).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
});

export type CVFormValues = z.infer<typeof cvFormSchema>;
