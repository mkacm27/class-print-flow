import React from "react";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer, Check, Plus, Minus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePrintJobForm } from "../hooks/use-print-job-form";

export const PrintJobForm: React.FC = () => {
  const {
    form,
    calculatedPrice,
    isLoading,
    isDuplicateAlertOpen,
    setIsDuplicateAlertOpen,
    onSubmit,
    confirmDuplicateSubmit,
    cancelDuplicateSubmit,
    adjustPages,
    classes,
    teachers,
    documentTypes,
    settings,
  } = usePrintJobForm();

  const { watch } = form;
  const printType = watch("printType");
  const rectoPages = watch("rectoPages") || 0;
  const rectoVersoPages = watch("rectoVersoPages") || 0;

  return (
    <>
      <div className="settings-card p-8 max-w-4xl mx-auto">
        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Job Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="className"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Name<span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classes.map((c) => (
                              <SelectItem key={c.id} value={c.name}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="teacherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher Name</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a teacher" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {teachers.map((t) => (
                              <SelectItem key={t.id} value={t.name}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {documentTypes.map((dt) => (
                              <SelectItem key={dt.id} value={dt.name}>
                                {dt.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Print Configuration</h3>
                  
                  <FormField
                    control={form.control}
                    name="printType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Print Type*</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          if (value === "Both") {
                            form.setValue("rectoPages", 0);
                            form.setValue("rectoVersoPages", 0);
                          }
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Recto">Recto (Single-sided)</SelectItem>
                            <SelectItem value="Recto-verso">Recto-verso (Double-sided)</SelectItem>
                            <SelectItem value="Both">Both (Mixed)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {printType === "Recto" && `Price per page: ${settings.priceRecto.toFixed(2)} MAD`}
                          {printType === "Recto-verso" && `Price per page: ${settings.priceRectoVerso.toFixed(2)} MAD`}
                          {printType === "Both" && "Mixed pricing for Recto and Recto-verso pages"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {printType === "Both" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Recto Pages<span className="text-destructive">*</span></FormLabel>
                    <div className="flex items-center">
                      <Button 
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => adjustPages('recto', false)}
                        disabled={rectoPages <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <FormControl>
                        <Input 
                          type="number"
                          {...form.register("rectoPages", { valueAsNumber: true })}
                          className="text-center mx-2"
                          min={0}
                        />
                      </FormControl>
                      <Button 
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => adjustPages('recto', true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      Price per page: {settings.priceRecto.toFixed(2)} MAD
                    </FormDescription>
                    <FormMessage />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Recto-Verso Pages<span className="text-destructive">*</span></FormLabel>
                    <div className="flex items-center">
                      <Button 
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => adjustPages('recto-verso', false)}
                        disabled={rectoVersoPages <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <FormControl>
                        <Input 
                          type="number"
                          {...form.register("rectoVersoPages", { valueAsNumber: true })}
                          className="text-center mx-2"
                          min={0}
                        />
                      </FormControl>
                      <Button 
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => adjustPages('recto-verso', true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      Price per page: {settings.priceRectoVerso.toFixed(2)} MAD
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="pages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Pages<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter number of pages" 
                          min={1}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="copies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Copies<span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter number of copies" 
                        min={1}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Mark as Paid
                      </FormLabel>
                      <FormDescription>
                        Check this if the payment has been received
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="gradient-bg rounded-2xl p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Total Price</h3>
                    <p className="text-white/80">Based on your selections</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{calculatedPrice.toFixed(2)} MAD</p>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full gradient-bg hover:opacity-90 text-white py-3 text-lg"
                disabled={isLoading}
              >
                <Printer className="w-5 h-5 mr-2" />
                {isLoading ? "Creating..." : "Create Print Job"}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      <AlertDialog open={isDuplicateAlertOpen} onOpenChange={setIsDuplicateAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Receipt Detected</AlertDialogTitle>
            <AlertDialogDescription>
              A similar receipt was created within the last 5 minutes. Are you sure you want to create another one?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDuplicateSubmit}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDuplicateSubmit}>
              <Check className="w-4 h-4 mr-2" />
              Create Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};