"use client";

import { ImageUploader } from "@/components/custom/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { VALID_CATEGORIES, VALID_TECHNOLOGIES } from "@/data";
import { cn } from "@/lib/utils";
import { createAppSchema } from "@/schema/app.schema";
import { getDashboardAppDetails, updateAppDetails } from "@/server/app";
import { ImageData } from "@/types";
import { AppPublishStatus } from "@/types/app";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, FilePlusCorner, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";

export default function EditAppDetails({ id }: { id: string }) {
  const router = useRouter();
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [initialImageData, setInitialImageData] = useState<ImageData | null>(
    null
  );

  const { isPending: isLoadingApp, data: appData } = useQuery({
    queryKey: ["dashboard-app-edit", id],
    queryFn: () => getDashboardAppDetails({ id }),
    meta: { showError: true },
  });

  const { mutate, isPending: isSavingApp } = useMutation({
    mutationFn: ({
      values,
      appId,
      imageData,
    }: {
      values: z.infer<typeof createAppSchema>;
      appId: string;
      imageData?: ImageData | null;
    }) => updateAppDetails(values, appId, imageData),
    onSuccess: () => {
      toast.success("App updated successfully");
      router.push("/dashboard/apps");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update app");
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      category: "",
      builtWith: [] as string[],
      websiteUrl: "",
      repoUrl: "",
      demoUrl: "",
      status: "published" as AppPublishStatus,
    },
    validators: { onSubmit: createAppSchema },
    onSubmit: ({ value }) => {
      const hasImageChanged =
        (imageData && !initialImageData) ||
        (imageData &&
          initialImageData &&
          imageData.imageProviderFileId !==
            initialImageData.imageProviderFileId);

      mutate({
        values: value,
        appId: id,
        imageData: hasImageChanged ? imageData : undefined,
      });
    },
  });

  const restoreOriginalData = () => {
    if (appData?.appDetails) {
      form.setFieldValue("name", appData.appDetails.name);
      form.setFieldValue("slug", appData.appDetails.slug);
      form.setFieldValue("description", appData.appDetails.description);
      form.setFieldValue("category", appData.appDetails.category);
      form.setFieldValue("builtWith", appData.appDetails.builtWith || []);
      form.setFieldValue("websiteUrl", appData.appDetails.websiteUrl || "");
      form.setFieldValue("repoUrl", appData.appDetails.repoUrl || "");
      form.setFieldValue("demoUrl", appData.appDetails.demoUrl || "");
      form.setFieldValue("status", appData.appDetails.status || "published");
      setImageData(initialImageData);
    }
  };

  useEffect(() => {
    if (appData?.appDetails) {
      setTimeout(() => {
        restoreOriginalData();

        if (
          appData.appDetails.imageProviderFileId &&
          appData.appDetails.image
        ) {
          const imageInfo: ImageData = {
            image: appData.appDetails.image,
            imageSource: appData.appDetails.imageSource,
            imageProviderFileId: appData.appDetails.imageProviderFileId,
          };
          setInitialImageData(imageInfo);
          setImageData(imageInfo);
        }
      }, 0);
    }
    // eslint-disable-next-line
  }, [appData, form]);

  if (isLoadingApp) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <Spinner className="mx-auto size-6" />
      </div>
    );
  }

  if (!appData) {
    return (
      <Empty className="border max-w-4xl mx-auto">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FilePlusCorner />
          </EmptyMedia>
          <EmptyTitle>App Not Found</EmptyTitle>
          <EmptyDescription>
            App with that ID not found. You can continue by submitting your own
            app or viewing other apps.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Link href="/dashboard/apps/new">
              <Button className="cursor-pointer">Submit App</Button>
            </Link>
            <Link href="/dashboard/apps">
              <Button className="cursor-pointer" variant="outline">
                View All Apps
              </Button>
            </Link>
          </div>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Edit App</h1>
        <p className="text-muted-foreground">
          Update the details for your application.
        </p>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-8">
            {/* App Name */}
            <FieldGroup>
              <form.Field name="name">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>App Name *</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Amazing App"
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
              <form.Field name="slug">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>App Slug *</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="amazing_app"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Use only lowercase letters and underscores
                      </p>
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>

            <FieldGroup>
              <form.Field name="description">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Description *
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        className="min-h-24"
                        placeholder="Describe what your app does, its key features, and who it's for..."
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
              <form.Field name="category">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field orientation="vertical" data-invalid={isInvalid}>
                      <FieldContent>
                        <FieldLabel htmlFor="category-select">
                          Select Category *
                        </FieldLabel>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </FieldContent>
                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger
                          id="category-select"
                          aria-invalid={isInvalid}
                          className="w-full"
                        >
                          <SelectValue placeholder="Choose a category..." />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                          {VALID_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>

            <form.Field name="builtWith">
              {(field) => {
                const selectedTechs = field.state.value || [];
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                const removeTech = (tech: string) => {
                  field.handleChange(selectedTechs.filter((t) => t !== tech));
                };

                const addTech = (tech: string) => {
                  if (!selectedTechs.includes(tech)) {
                    field.handleChange([...selectedTechs, tech]);
                  }
                };

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Built With *</FieldLabel>

                    {selectedTechs.length > 0 && (
                      <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                        <p className="text-sm font-medium mb-2">
                          Selected Technologies ({selectedTechs.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedTechs.map((tech) => (
                            <div
                              key={tech}
                              className="px-3 py-1.5 rounded-lg border bg-background font-medium text-sm flex items-center gap-2"
                            >
                              {tech}
                              <button
                                type="button"
                                onClick={() => removeTech(tech)}
                                className="hover:opacity-70 transition-opacity"
                                aria-label={`Remove ${tech}`}
                              >
                                <X className="w-3.5 h-3.5 cursor-pointer" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={comboboxOpen}
                          className="w-full justify-between"
                        >
                          Select technologies...
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search technologies..." />
                          <CommandList>
                            <CommandEmpty>No technology found.</CommandEmpty>
                            <CommandGroup>
                              {VALID_TECHNOLOGIES.map((tech) => (
                                <CommandItem
                                  key={tech}
                                  value={tech}
                                  onSelect={(currentValue) => {
                                    const technology = VALID_TECHNOLOGIES.find(
                                      (t) =>
                                        t.toLowerCase() ===
                                        currentValue.toLowerCase()
                                    );
                                    if (technology) {
                                      addTech(technology);
                                      setComboboxOpen(false);
                                    }
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedTechs.includes(tech)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {tech}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                    <p className="text-xs mt-2 text-muted-foreground">
                      Select at least one technology your app is built with.
                    </p>
                  </Field>
                );
              }}
            </form.Field>

            <FieldGroup>
              <form.Field name="websiteUrl">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Website URL</FieldLabel>
                      <Input
                        type="url"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="https://amazingapp.com"
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
              <form.Field name="repoUrl">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Repository URL
                      </FieldLabel>
                      <Input
                        type="url"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="https://github.com/username/repo"
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
              <form.Field name="demoUrl">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Demo URL</FieldLabel>
                      <Input
                        type="url"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="https://demo.amazingapp.com"
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
              <FieldLabel>Upload Image *</FieldLabel>
              <ImageUploader
                type="app"
                onImageDataChange={setImageData}
                initialImageData={initialImageData}
              />
            </FieldGroup>

            <FieldGroup>
              <form.Field name="status">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field orientation="vertical" data-invalid={isInvalid}>
                      <FieldContent>
                        <FieldLabel htmlFor="form-tanstack-select-status">
                          Select Status
                        </FieldLabel>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </FieldContent>
                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(value as AppPublishStatus)
                        }
                      >
                        <SelectTrigger
                          id="form-tanstack-select-status"
                          aria-invalid={isInvalid}
                          className="w-full"
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                          <SelectItem value="published">
                            Published (Published Immediately)
                          </SelectItem>
                          <SelectItem value="draft">
                            Draft (Save for Later)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs mt-2 text-muted-foreground">
                        Whether to publish your app or just create a draft.
                      </p>
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>
          </div>
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
              onClick={restoreOriginalData}
              disabled={isSavingApp}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => form.handleSubmit()}
              className="w-40 cursor-pointer gap-2"
              disabled={isSavingApp}
            >
              {isSavingApp && <Spinner />}
              {isSavingApp ? "Saving..." : "Save Changes"}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}
