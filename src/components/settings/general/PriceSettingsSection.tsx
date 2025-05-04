
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { formSchema } from "./schema";

interface PriceSettingsSectionProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export const PriceSettingsSection: React.FC<PriceSettingsSectionProps> = ({ form }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Price Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="priceRecto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price per Page (Recto)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priceRectoVerso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price per Page (Recto-verso)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priceBoth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price per Page (Both)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
