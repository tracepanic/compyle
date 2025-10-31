"use client";

import Link from "next/link";
import { GitPullRequestCreateArrow } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "@tanstack/react-form";
import { signupSchema } from "@/schema/signup.schema";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signUp } from "@/lib/auth-client";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    validators: { onSubmit: signupSchema },
    onSubmit: async ({ value }) => {
      await signUp.email(
        {
          name: value.name,
          email: value.email,
          password: value.password,
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            setIsLoading(false);
            form.reset();
          },
          onError: (ctx) => {
            setIsLoading(false);
            form.reset();
            alert(ctx.error.message);
          },
        },
      );
    },
  });

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-3 self-center font-medium"
        >
          <div className="bg-muted-foreground/25 flex items-center justify-center rounded-md p-1">
            <GitPullRequestCreateArrow />
          </div>
          <span className="font-semibold text-lg">Compyle Apps</span>
        </Link>

        {/* Signup Form*/}
        <Card className="md:min-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Create your account</CardTitle>
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
                          placeholder=""
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
          <CardFooter>
            <Field
              orientation="horizontal"
              className="w-full flex justify-between"
            >
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => form.reset()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="signup-form"
                className="w-40 cursor-pointer gap-2"
                disabled={isLoading}
              >
                {isLoading && <Spinner />}
                {isLoading ? "Loading..." : "Continue"}
              </Button>
            </Field>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
