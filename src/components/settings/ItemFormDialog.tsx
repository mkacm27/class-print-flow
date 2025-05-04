
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const itemNameSchema = z.object({
  itemName: z.string().min(1, { message: "Name cannot be empty" }),
});

type ItemFormValues = z.infer<typeof itemNameSchema>;

interface ItemFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ItemFormValues) => void;
  title: string;
  description: string;
  placeholder: string;
  isEditing: boolean;
  initialValue?: string;
}

export const ItemFormDialog: React.FC<ItemFormDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  title,
  description,
  placeholder,
  isEditing,
  initialValue = "",
}) => {
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemNameSchema),
    defaultValues: {
      itemName: initialValue,
    },
  });

  // Reset form with new initial values when they change
  React.useEffect(() => {
    form.reset({ itemName: initialValue });
  }, [initialValue, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="py-4">
              <FormField
                control={form.control}
                name="itemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={placeholder} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
