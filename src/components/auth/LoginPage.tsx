import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/ui/Misc";
import { Button } from "@/ui/Button";
import { useAuth } from "@/core/auth/useAuth";
import { useI18n } from "@/core/i18n";
import { LayoutDashboard } from "lucide-react";

export function LoginPage() {
  const { t } = useI18n();

  const loginSchema = useMemo(() => z.object({
    email: z.string().email(t.auth.invalid_email),
    password: z.string().min(6, t.auth.password_min_length),
  }), [t.auth.invalid_email, t.auth.password_min_length]);

  type LoginFormValues = z.infer<typeof loginSchema>;

  const { login, isLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    await login(data);
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-[hsl(var(--background))] overflow-hidden p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[hsl(var(--primary)/0.15)] via-[hsl(var(--background))] to-[hsl(var(--background))]"></div>
      <div className="absolute -left-[20%] top-[20%] h-[500px] w-[500px] rounded-full bg-[hsl(var(--primary)/0.05)] blur-[100px]"></div>
      <div className="absolute -right-[20%] bottom-[20%] h-[600px] w-[600px] rounded-full bg-[hsl(var(--primary)/0.08)] blur-[120px]"></div>
      
      <Card className="relative w-full max-w-md p-8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-500 border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.8)] backdrop-blur-2xl rounded-[32px]">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--primary))] text-white shadow-lg">
            <LayoutDashboard className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t.auth.welcome_back}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] text-center">
            {t.auth.enter_credentials}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              {t.auth.email}
            </label>
            <input
              {...register("email")}
              id="email"
              type="email"
              className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              placeholder="admin@example.com"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="password">
                {t.auth.password}
              </label>
            </div>
            <input
              {...register("password")}
              id="password"
              type="password"
              className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? t.auth.signing_in : t.auth.sign_in}
          </Button>
        </form>
      </Card>
    </div>
  );
}
