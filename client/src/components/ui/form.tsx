"use client";

import * as React from "react";
import { Controller, FormProvider, useFormContext, useFormState, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/src/shared/lib/utils";
import { Label } from "@/components/ui/label";

const Form = FormProvider;
type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = { name: TName };
const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

function FormField<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return <FormFieldContext.Provider value={{ name: props.name }}><Controller {...props} /></FormFieldContext.Provider>;
}

type FormItemContextValue = { id: string };
const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const id = React.useId();
  return <FormItemContext.Provider value={{ id }}><div className={cn("grid gap-2", className)} {...props} /></FormItemContext.Provider>;
}

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, control } = useFormContext();
  const formState = useFormState({ control, name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);
  if (!fieldContext.name) throw new Error("Form components must be nested inside FormField.");
  const id = itemContext.id;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

const FormLabel = React.forwardRef<React.ElementRef<typeof Label>, React.ComponentPropsWithoutRef<typeof Label>>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  return <Label ref={ref} className={cn("block text-xs font-semibold text-[var(--ink)]", error && "text-red-700", className)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>((props, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return <Slot ref={ref} id={formItemId} aria-describedby={error ? formMessageId : formDescriptionId} aria-invalid={Boolean(error)} {...props} />;
});
FormControl.displayName = "FormControl";

function FormDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { formDescriptionId } = useFormField();
  return <p id={formDescriptionId} className={cn("text-xs text-[var(--muted)]", className)} {...props} />;
}

function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { error, formMessageId } = useFormField();
  const message = error ? String(error.message ?? "") : children;
  if (!message) return null;
  return <p id={formMessageId} role="alert" className={cn("text-xs font-medium text-red-700", className)} {...props}>{message}</p>;
}

export { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, useFormField };
