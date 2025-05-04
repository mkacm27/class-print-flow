
import { z } from "zod";

export const formSchema = z.object({
  shopName: z.string().min(1, { message: "Shop name is required" }),
  contactInfo: z.string(),
  priceRecto: z.coerce.number().min(0, { message: "Must be a positive number" }),
  priceRectoVerso: z.coerce.number().min(0, { message: "Must be a positive number" }),
  priceBoth: z.coerce.number().min(0, { message: "Must be a positive number" }),
  maxUnpaidThreshold: z.coerce.number().min(0, { message: "Must be a positive number" }),
  whatsappTemplate: z.string(),
  defaultSavePath: z.string(),
  enableAutoPdfSave: z.boolean().default(true),
  enableWhatsappNotification: z.boolean().default(true),
});

export type GeneralSettingsFormValues = z.infer<typeof formSchema>;
