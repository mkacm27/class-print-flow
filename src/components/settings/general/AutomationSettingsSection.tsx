
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { GeneralSettingsFormValues } from "./schema";

interface AutomationSettingsSectionProps {
  form: UseFormReturn<GeneralSettingsFormValues>;
}

export const AutomationSettingsSection = ({ form }: AutomationSettingsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Automation Settings</h3>

      <FormField
        control={form.control}
        name="enableAutoPdfSave"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>Automatically Save PDF Receipts</FormLabel>
              <FormDescription>
                When enabled, PDF receipts will be saved automatically when creating new print jobs
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
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
              <FormLabel>Enable WhatsApp Notifications</FormLabel>
              <FormDescription>
                When enabled, WhatsApp sharing will be available for receipts
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="enableAutoPaidNotification"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>Auto Send Paid Notifications</FormLabel>
              <FormDescription>
                Automatically send a WhatsApp notification when marking a receipt as paid
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

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
              The default folder path where PDF receipts will be saved
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
