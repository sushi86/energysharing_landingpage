import { z } from "zod";

import { ALL_ORTSTEIL_VALUES } from "./ortsteile";

const ortsteilSchema = z.enum(ALL_ORTSTEIL_VALUES as [string, ...string[]], {
  message: "Bitte wähle einen Ortsteil aus der Liste.",
});

const baseSchema = z.object({
  firstName: z.string().trim().min(1, "Bitte gib deinen Vornamen an.").max(100),
  lastName: z.string().trim().min(1, "Bitte gib deinen Nachnamen an.").max(100),
  email: z.email({ message: "Bitte gib eine gültige E-Mail-Adresse an." }).max(254),
  ortsteil: ortsteilSchema,
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  privacyConsent: z.literal(true, {
    message: "Bitte bestätige die Datenschutzerklärung.",
  }),
});

export const producerSchema = baseSchema.extend({
  role: z.literal("produzent"),
  systemSizeKwp: z.number().int().min(1).max(30),
  smartMeter: z.enum(["ja", "nein", "weiss_nicht"]),
});

export const consumerSchema = baseSchema.extend({
  role: z.literal("verbraucher"),
  hasEv: z.boolean(),
  hasHeatPump: z.boolean(),
  yearlyConsumptionKwh: z.number().int().min(1000).max(8000),
});

export const waitlistSchema = z.discriminatedUnion("role", [
  producerSchema,
  consumerSchema,
]);

export type WaitlistInput = z.infer<typeof waitlistSchema>;
export type ProducerInput = z.infer<typeof producerSchema>;
export type ConsumerInput = z.infer<typeof consumerSchema>;
