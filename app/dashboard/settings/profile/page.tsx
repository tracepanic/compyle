"use client";

import { ImageUploader } from "@/components/custom/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { updateUser, useSession } from "@/lib/auth-client";
import { queryClient } from "@/providers/query.provider";
import { updateProfileSchema } from "@/schema/auth.schema";
import { ImageData } from "@/types";
import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProfileSettings() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [initialImageData, setInitialImageData] = useState<ImageData | null>(
    null
  );

  const { data, error, isPending, refetch } = useSession();

  const form = useForm({
    defaultValues: { name: "", about: "" },
    validators: { onSubmit: updateProfileSchema },
    onSubmit: async ({ value }) => {
      const nameUnchanged = value.name === data?.user.name;
      const aboutUnchanged = value.about === data?.user.about;
      const imageChanged =
        imageData?.image !== initialImageData?.image ||
        imageData?.imageProviderFileId !==
          initialImageData?.imageProviderFileId ||
        imageData?.imageSource !== initialImageData?.imageSource;

      // Check if nothing has changed
      if (nameUnchanged && aboutUnchanged && !imageChanged) {
        toast.error("No changes to update");
        return;
      }

      setIsUpdating(true);
      const id = toast.loading("Updating profile...");
      const { error } = await updateUser({
        name: value.name,
        about: value.about,
        image: imageData?.image ?? null,
        imageProviderFileId: imageData?.imageProviderFileId ?? null,
        imageSource: imageData?.imageSource ?? "none",
      });

      toast.dismiss(id);
      setIsUpdating(false);
      if (error) {
        toast.error("Failed to update profile");
      } else {
        refetch();
        setInitialImageData(imageData);
        toast.success("Profile updated successfully.");
        queryClient.invalidateQueries({
          queryKey: ["user-global-auth-session"],
        });
      }
    },
  });

  useEffect(() => {
    if (data && !isPending && !error) {
      setTimeout(() => {
        form.setFieldValue("name", data.user.name);
        form.setFieldValue("about", data.user.about as string);

        if (!data.user.image) {
          setInitialImageData(null);
          setImageData(null);
        } else {
          const imageInfo: ImageData = {
            image: data.user.image as string,
            imageProviderFileId: data.user.imageProviderFileId as
              | string
              | undefined,
            imageSource:
              (data.user.imageSource as ImageData["imageSource"]) ?? "none",
          };
          setInitialImageData(imageInfo);
          setImageData(imageInfo);
        }
      }, 0);
    }
  }, [data, error, form, isPending]);

  return (
    <div className="space-y-6 w-full">
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Update Profile</h1>
        <p className="text-muted-foreground">
          Update your personal information, avatar, and public profile details.
        </p>
      </div>

      {isPending && (
        <div className="mt-4 w-full mx-auto">
          <Spinner className="mx-auto size-6" />
        </div>
      )}

      {!isPending && (
        <form
          id="update-profile"
          className="w-full"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <Card className="w-full max-w-3xl mx-auto mt-6">
            <CardContent>
              <div className="space-y-6">
                <FieldGroup>
                  <form.Field name="name">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Full Name *
                          </FieldLabel>
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
                  <form.Field name="about">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>About *</FieldLabel>
                          <Textarea
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="My about information..."
                            className="min-h-24"
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
                  <Field>
                    <FieldLabel className="mb-4">Your Avatar</FieldLabel>
                    <ImageUploader
                      type="profile"
                      onImageDataChange={setImageData}
                      initialImageData={initialImageData}
                    />
                  </Field>
                </FieldGroup>
              </div>
            </CardContent>
            <CardFooter className="flex flex-row">
              <Field
                orientation="horizontal"
                className="w-full flex justify-between"
              >
                <div></div>
                <Button
                  disabled={isUpdating}
                  type="submit"
                  form="update-profile"
                  className="w-40 gap-2 cursor-pointer"
                >
                  {isUpdating && <Spinner />}
                  {isUpdating ? "Loading..." : "Update Profile"}
                </Button>
              </Field>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
