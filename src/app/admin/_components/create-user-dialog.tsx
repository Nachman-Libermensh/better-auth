"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createUserAction } from "../users/actions";

const formSchema = z.object({
  name: z.string().min(2, "יש להזין שם מלא"),
  email: z.string().email("יש להזין כתובת אימייל תקינה"),
  password: z
    .string()
    .min(8, "סיסמה חייבת להכיל לפחות 8 תווים")
    .max(128, "הסיסמה ארוכה מדי"),
  role: z.enum(["USER", "ADMIN"], {
    message: "יש לבחור תפקיד",
  }),
});

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await createUserAction(values);

      if (!result.success) {
        toast.error(result.error ?? "אירעה שגיאה בעת יצירת המשתמש");
        return;
      }

      toast.success(result.message ?? "המשתמש נוצר בהצלחה");
      form.reset({
        name: "",
        email: "",
        password: "",
        role: "USER",
      });
      setOpen(false);
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="gap-2">
          <Plus className="size-4" />
          הוספת משתמש
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader className="text-right">
          <DialogTitle>הוספת משתמש חדש</DialogTitle>
          <DialogDescription>
            מלאו את הפרטים הבאים כדי ליצור משתמש חדש במערכת.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4 text-right">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>שם מלא</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="שם מלא"
                      disabled={isPending}
                      dir="rtl"
                      autoComplete="name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>אימייל</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="name@example.com"
                      disabled={isPending}
                      dir="ltr"
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>סיסמה זמנית</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      disabled={isPending}
                      autoComplete="new-password"
                      dir="ltr"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תפקיד</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחרו תפקיד" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">משתמש</SelectItem>
                        <SelectItem value="ADMIN">מנהל</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex-row-reverse gap-2 pt-2">
              <Button type="submit" disabled={isPending}>
                שמירת משתמש
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                ביטול
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
