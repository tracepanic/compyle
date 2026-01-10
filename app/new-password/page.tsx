"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { resetPassword } from "@/lib/auth-client";
import { resetPasswordSchema } from "@/schema/auth.schema";
import { useAuthStore } from "@/store/session.store";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

function NewPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isInitialPending, authInfo } = useAuthStore();

  const error = searchParams.get("error");
  const token = searchParams.get("token") || "";

  const form = useForm({
    defaultValues: { password: "" },
    validators: { onSubmit: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      setIsLoading(true);

      const { error } = await resetPassword({
        token,
        newPassword: value.password,
      });

      setIsLoading(false);

      if (error) {
        toast.error(error.message || "Failed to reset your password");
        form.reset();
      } else {
        toast.success("Password updated successfully");
        router.push("/login");
      }
    },
  });

  useEffect(() => {
    if (error === "INVALID_TOKEN") {
      toast.error("Invalid password reset token. Redirecting...");
      const timer = setTimeout(() => router.push("/forgot-password"), 1500);
      return () => clearTimeout(timer);
    }

    if (!token) {
      toast.error("Password reset token not found. Redirecting...");
      const timer = setTimeout(() => router.push("/forgot-password"), 1500);
      return () => clearTimeout(timer);
    }
  }, [token, router, error]);

  useEffect(() => {
    if (authInfo?.session) router.replace("/dashboard");
  }, [authInfo?.session, router]);

  if (authInfo?.session) return null;

  if (isInitialPending) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <div>
          <Spinner className="mx-auto size-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="max-w-md w-full">
        <Card className="md:min-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Reset Password</CardTitle>
            <CardDescription>
              Enter your new password to reset it
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              id="reset-password-form"
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <FieldGroup>
                <form.Field name="password">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          New Password
                        </FieldLabel>
                        <Input
                          type="password"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Enter password"
                          autoComplete="off"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="flex flex-row">
            <Field
              orientation="horizontal"
              className="w-full flex justify-between"
            >
              <Button
                type="submit"
                form="reset-password-form"
                className="w-full cursor-pointer gap-2"
                disabled={isLoading}
              >
                {isLoading && <Spinner />}
                {isLoading ? "Loading..." : "Save password"}
              </Button>
            </Field>
          </CardFooter>

          <p className="text-center text-muted-foreground text-sm">
            Remembered your password?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function NewPassword() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Spinner className="size-6" />
        </div>
      }
    >
      <NewPasswordForm />
    </Suspense>
  );
}
