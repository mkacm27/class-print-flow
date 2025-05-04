
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { formSchema } from "./schema";

interface ShopInformationSectionProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export const ShopInformationSection: React.FC<ShopInformationSectionProps> = ({ form }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Shop Information</h3>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="shopName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter shop name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Information</FormLabel>
              <FormControl>
                <Textarea placeholder="Address, phone, email, etc." {...field} />
              </FormControl>
              <FormDescription>
                This will be displayed on the receipts
              </FormDescription>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
