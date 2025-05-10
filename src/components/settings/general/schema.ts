
import { z } from "zod";

export const formSchema = z.object({
  shopName: z.string().min(1, "Shop name is required"),
  contactInfo: z.string().min(1, "Contact information is required"),
  priceRecto: z.coerce.number().min(0.01, "Price must be at least 0.01"),
  priceRectoVerso: z.coerce.number().min(0.01, "Price must be at least 0.01"),
  priceBoth: z.coerce.number().min(0.01, "Price must be at least 0.01"),
  maxUnpaidThreshold: z.coerce.number().min(0, "Threshold must be at least 0"),
  whatsappTemplate: z.string().optional(),
  defaultSavePath: z.string().optional(),
  enableAutoPdfSave: z.boolean().default(true),
  enableWhatsappNotification: z.boolean().default(true),
  enableAutoPaidNotification: z.boolean().default(false),
});

export type GeneralSettingsFormValues = z.infer<typeof formSchema>;
