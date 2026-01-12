"use client";

import { SocialAuth } from "@/app/signup/socials";
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
import { isUsernameAvailable, signUp } from "@/lib/auth-client";
import { signupSchema } from "@/schema/auth.schema";
import { useAuthStore } from "@/store/session.store";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function Signup() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({
    checking: false,
    available: null,
    message: "",
  });

  const { isInitialPending, authInfo } = useAuthStore();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!username || username.length < 5) {
      setUsernameStatus({
        checking: false,
        available: null,
        message: "",
      });
      return;
    }

    setUsernameStatus({
      checking: true,
      available: null,
      message: "Checking availability...",
    });

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const { data: response, error } = await isUsernameAvailable({
          username: username,
        });

        if (error) {
          setUsernameStatus({
            checking: false,
            available: false,
            message: "Error checking username",
          });
          return;
        }

        if (response?.available) {
          setUsernameStatus({
            checking: false,
            available: true,
            message: "Username is available",
          });
        } else {
          setUsernameStatus({
            checking: false,
            available: false,
            message: "Username is already taken",
          });
        }
      } catch {
        setUsernameStatus({
          checking: false,
          available: false,
          message: "Error checking username",
        });
      }
    }, 1000);
  }, []);

  const form = useForm({
    defaultValues: { name: "", email: "", username: "", password: "" },
    validators: { onSubmit: signupSchema },
    onSubmit: async ({ value }) => {
      if (usernameStatus.available === false) {
        toast.error("Please choose an available username");
        return;
      }

      await signUp.email(
        {
          name: value.name,
          email: value.email,
          username: value.username,
          password: value.password,
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            setIsLoading(false);
            form.reset();
            toast.success("Account created successfully");
            router.push("/login");
          },
          onError: (ctx) => {
            setIsLoading(false);
            form.reset();
            toast.error(ctx.error.message || "Something went wrong");
          },
        }
      );
    },
  });

  useEffect(() => {
    if (authInfo?.session) router.replace("/dashboard");
  }, [authInfo?.session, router]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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
            <CardTitle className="text-xl">Create Account</CardTitle>
            <CardDescription>
              Enter your info below to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="signup-form"
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <FieldGroup>
                <form.Field name="name">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="John Doe"
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

              <FieldGroup>
                <form.Field name="username">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                        <div className="relative">
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.handleChange(value);
                              checkUsernameAvailability(value);
                            }}
                            aria-invalid={isInvalid}
                            placeholder="johndoe"
                            autoComplete="off"
                          />
                          {usernameStatus.checking && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Spinner className="size-4" />
                            </div>
                          )}
                          {!usernameStatus.checking &&
                            usernameStatus.available === true && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                ✓
                              </div>
                            )}
                          {!usernameStatus.checking &&
                            usernameStatus.available === false && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                                ✗
                              </div>
                            )}
                        </div>
                        {field.state.value.length >= 5 &&
                          usernameStatus.message && (
                            <p
                              className={`text-sm mt-1 ${
                                usernameStatus.available === true
                                  ? "text-green-600"
                                  : usernameStatus.available === false
                                    ? "text-red-600"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {usernameStatus.message}
                            </p>
                          )}
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>

              <FieldGroup>
                <form.Field name="password">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
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
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  form.reset();
                  setUsernameStatus({
                    checking: false,
                    available: null,
                    message: "",
                  });
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="signup-form"
                className="w-40 cursor-pointer gap-2"
                disabled={isLoading || usernameStatus.available === false}
              >
                {isLoading && <Spinner />}
                {isLoading ? "Loading..." : "Signup"}
              </Button>
            </Field>
          </CardFooter>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </p>

          <SocialAuth />
        </Card>
      </div>
    </div>
  );
}
