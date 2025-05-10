
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
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
      <h3 className="text-lg font-medium mb-4">Price Settings (MAD)</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="priceRecto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price per Page (Recto)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...field} 
                    className="pl-14"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-muted border-r rounded-l-md">
                    MAD
                  </div>
                </div>
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
                <div className="relative">
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...field}
                    className="pl-14"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-muted border-r rounded-l-md">
                    MAD
                  </div>
                </div>
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
                <div className="relative">
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...field}
                    className="pl-14"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-muted border-r rounded-l-md">
                    MAD
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                Price for mixed printing (both recto and recto-verso in same job)
              </FormDescription>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
