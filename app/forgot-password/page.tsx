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
import { env } from "@/env/client";
import { requestPasswordReset } from "@/lib/auth-client";
import { updateEmailSchema } from "@/schema/auth.schema";
import { useAuthStore } from "@/store/session.store";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { isInitialPending, authInfo } = useAuthStore();

  const form = useForm({
    defaultValues: { email: "" },
    validators: { onSubmit: updateEmailSchema },
    onSubmit: async ({ value }) => {
      setIsLoading(true);

      const { error } = await requestPasswordReset({
        email: value.email,
        redirectTo: `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/new-password`,
      });

      setIsLoading(false);

      if (error) {
        toast.error("Failed to send password reset email");
        form.reset();
      } else {
        toast.success("Check your email for a password reset link.");
      }
    },
  });

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
            <CardTitle className="text-xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address to reset your password
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              id="forgot-password-form"
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <FieldGroup>
                <form.Field name="email">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Email Address
                        </FieldLabel>
                        <Input
                          type="email"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="johndoe@domain.com"
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
                form="forgot-password-form"
                className="w-full cursor-pointer gap-2"
                disabled={isLoading}
              >
                {isLoading && <Spinner />}
                {isLoading ? "Loading..." : "Continue"}
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
