
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { formSchema } from "./schema";

interface AutomationSettingsSectionProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export const AutomationSettingsSection: React.FC<AutomationSettingsSectionProps> = ({ form }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Automation Settings</h3>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="defaultSavePath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default PDF Save Path</FormLabel>
              <FormControl>
                <Input placeholder="C:/PrintReceipts" {...field} />
              </FormControl>
              <FormDescription>
                Base directory where PDF receipts will be saved
              </FormDescription>
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="enableAutoPdfSave"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Automatically Save PDF Receipts</FormLabel>
                  <FormDescription>
                    Generate and save PDF receipts after each print job
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableWhatsappNotification"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Enable WhatsApp Web Sharing</FormLabel>
                  <FormDescription>
                    Automatically open WhatsApp Web to share receipts
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="whatsappTemplate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp Message Template</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Hello! Your print job receipt #{{serialNumber}} for {{className}} is ready. Total amount: ${{totalPrice}}." 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                You can use placeholders: &#123;&#123;serialNumber&#125;&#125;, &#123;&#123;className&#125;&#125;, and &#123;&#123;totalPrice&#125;&#125;
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxUnpaidThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Unpaid Balance ($)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormDescription>
                Warning will be shown for classes exceeding this threshold
              </FormDescription>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
