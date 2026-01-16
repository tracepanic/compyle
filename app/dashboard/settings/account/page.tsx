"use client";

import { columns } from "@/app/dashboard/settings/account/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  changeEmail,
  changePassword,
  deleteUser,
  getSession,
  linkSocial,
  listAccounts,
  listSessions,
  unlinkAccount,
  updateUser,
} from "@/lib/auth-client";
import { queryClient } from "@/providers/query.provider";
import {
  updateEmailSchema,
  updatePasswordSchema,
  updateUsernameSchema,
} from "@/schema/auth.schema";
import { useForm } from "@tanstack/react-form";
import { useQueries } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Shield, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function AccountSettings() {
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [isLinkingGithub, setIsLinkingGithub] = useState(false);
  const [isUnlinkingGoogle, setIsUnlinkingGoogle] = useState(false);
  const [isUnlinkingGithub, setIsUnlinkingGithub] = useState(false);

  const results = useQueries({
    queries: [
      {
        queryKey: ["your-session"],
        queryFn: () => getSession(),
        staleTime: 0,
      },
      {
        queryKey: ["all-sessions"],
        queryFn: () => listSessions(),
        staleTime: 0,
      },
      {
        queryKey: ["all-accounts"],
        queryFn: () => listAccounts(),
        staleTime: 0,
      },
    ],
  });

  const [yourSession, allSessions, allAccounts] = results;
  const isInitialPending = results.some((result) => result.isLoading);

  const emailForm = useForm({
    defaultValues: { email: "" },
    validators: { onSubmit: updateEmailSchema },
    onSubmit: async ({ value }) => {
      if (value.email === yourSession.data?.data?.user.email) {
        toast.error("Cannot update email to the same address");
        return;
      }

      setIsUpdatingEmail(true);
      const id = toast.loading("Changing email address...");
      const { error } = await changeEmail({
        newEmail: value.email,
        callbackURL: "/dashboard",
      });

      toast.dismiss(id);
      setIsUpdatingEmail(false);
      if (error) {
        toast.error("Failed to update email address");
      } else {
        queryClient.invalidateQueries({ queryKey: ["your-session"] });
        toast.success(
          "Email updated successfully. Check your new email inbox to verify it."
        );
      }
    },
  });

  const usernameForm = useForm({
    defaultValues: { username: "" },
    validators: { onSubmit: updateUsernameSchema },
    onSubmit: async ({ value }) => {
      if (value.username === yourSession.data?.data?.user.username) {
        toast.error("Cannot update username to the same username");
        return;
      }

      setIsUpdatingUsername(true);
      const id = toast.loading("Changing username...");
      const { error } = await updateUser({
        username: value.username,
      });

      toast.dismiss(id);
      setIsUpdatingUsername(false);
      if (error) {
        toast.error("Failed to update username");
      } else {
        queryClient.invalidateQueries({ queryKey: ["your-session"] });
        toast.success("Username updated successfully.");
      }
    },
  });

  const passwordForm = useForm({
    defaultValues: { newPassword: "", currentPassword: "" },
    validators: { onSubmit: updatePasswordSchema },
    onSubmit: async ({ value }) => {
      if (!hasCredentialsAccount) {
        toast.error("You are currently not using email and password to login");
      }

      setIsUpdatingPassword(true);
      const id = toast.loading("Updating password...");
      const { error } = await changePassword({
        newPassword: value.newPassword,
        currentPassword: value.currentPassword,
        revokeOtherSessions: true,
      });

      toast.dismiss(id);
      setIsUpdatingPassword(false);
      if (error) {
        toast.error("Failed to change password");
      } else {
        queryClient.invalidateQueries({ queryKey: ["all-sessions"] });
        toast.success("Password updated successfully.");
      }
    },
  });

  const hasCredentialsAccount = useMemo(() => {
    const accounts = allAccounts.data?.data ?? [];
    return accounts.some((account) => account.providerId === "credential");
  }, [allAccounts.data?.data]);

  const tableData = useMemo(() => {
    const sessions = allSessions.data?.data ?? [];
    const currentSessionId = yourSession.data?.data?.session.id;

    return sessions.map((session) => ({
      id: session.id,
      ipAddress: session.ipAddress ?? "Unknown",
      userAgent: session.userAgent ?? "Unknown",
      lastSignIn: session.updatedAt,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isCurrent: session.id === currentSessionId,
      sessionToken: session.token,
    }));
  }, [allSessions.data?.data, yourSession.data?.data?.session.id]);

  const connectedProviders = new Set(
    (allAccounts.data?.data ?? []).map((a) => a.providerId.toLowerCase())
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    const session = yourSession.data?.data;

    if (!yourSession.isPending && !yourSession.error && session) {
      setTimeout(() => {
        emailForm.setFieldValue("email", session.user.email);
        usernameForm.setFieldValue("username", session.user.username!);
      }, 0);
    }
  }, [
    yourSession.data,
    yourSession.isPending,
    yourSession.error,
    emailForm,
    usernameForm,
  ]);

  async function handleDeleteUser() {
    const id = toast.loading("Deleting user account...");
    const { error } = await deleteUser({ callbackURL: "/" });

    toast.dismiss(id);
    if (error) {
      toast.error("Failed to delete user account");
    } else {
      toast.success("User account deleted successfully");
    }
  }

  async function handleLinkGoogle() {
    setIsLinkingGoogle(true);
    toast.success("Connecting to Google...");

    const { error } = await linkSocial({
      provider: "google",
      callbackURL: "/dashboard/settings/account",
    });

    setIsLinkingGoogle(false);
    if (error) {
      toast.error("Failed to connect Google account");
    }
  }

  async function handleLinkGithub() {
    setIsLinkingGithub(true);
    toast.success("Connecting to GitHub...");

    const { error } = await linkSocial({
      provider: "github",
      callbackURL: "/dashboard/settings/account",
    });

    setIsLinkingGithub(false);
    if (error) {
      toast.error("Failed to connect GitHub account");
    }
  }

  async function handleUnlinkGoogle() {
    setIsUnlinkingGoogle(true);
    toast.success("Disconnecting Google...");

    setIsUnlinkingGoogle(false);
    const { error } = await unlinkAccount({
      providerId: "google",
    });

    if (error) {
      toast.error("Failed to disconnect Google account");
    } else {
      queryClient.invalidateQueries({ queryKey: ["all-accounts"] });
    }
  }

  async function handleUnlinkGithub() {
    setIsUnlinkingGithub(true);
    toast.success("Disconnecting GitHub...");

    const { error } = await unlinkAccount({
      providerId: "github",
    });

    setIsUnlinkingGithub(false);
    if (error) {
      toast.error("Failed to disconnect GitHub account");
    } else {
      queryClient.invalidateQueries({ queryKey: ["all-accounts"] });
    }
  }

  return (
    <div className="space-y-6 w-full">
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information, password, connections, and security
          settings.
        </p>
      </div>

      {isInitialPending && (
        <div className="mt-4 w-full mx-auto">
          <Spinner className="mx-auto size-6" />
        </div>
      )}

      {!isInitialPending && (
        <div className="w-full max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                id="update-email"
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  emailForm.handleSubmit();
                }}
              >
                <FieldGroup>
                  <emailForm.Field name="email">
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
                          {!yourSession.data?.data?.user.emailVerified && (
                            <FieldDescription className="text-destructive">
                              Your email address has not been verified. Please
                              click{" "}
                              <Link
                                href="/verify-email"
                                className="text-primary"
                              >
                                here
                              </Link>{" "}
                              to verify your email and avoid getting restricted
                              on some actions across the app.
                            </FieldDescription>
                          )}
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  </emailForm.Field>
                </FieldGroup>
                <Button
                  disabled={isUpdatingEmail}
                  type="submit"
                  form="update-email"
                  className="w-full gap-2 cursor-pointer"
                >
                  {isUpdatingEmail && <Spinner />}
                  {isUpdatingEmail ? "Loading..." : "Update Email"}
                </Button>
              </form>

              <form
                id="update-username"
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  usernameForm.handleSubmit();
                }}
              >
                <FieldGroup>
                  <usernameForm.Field name="username">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="johndoe"
                            autoComplete="off"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  </usernameForm.Field>
                </FieldGroup>
                <Button
                  disabled={isUpdatingUsername}
                  type="submit"
                  form="update-username"
                  className="w-full gap-2 cursor-pointer"
                >
                  {isUpdatingUsername && <Spinner />}
                  {isUpdatingUsername ? "Loading..." : "Update Username"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Update Password</CardTitle>
              <CardDescription>
                Changing your password will also log you out in all other
                devices you are currently logged in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                id="update-password"
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  passwordForm.handleSubmit();
                }}
              >
                <FieldGroup>
                  <passwordForm.Field name="currentPassword">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Current Password
                          </FieldLabel>
                          <Input
                            type="password"
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            autoComplete="off"
                            placeholder="Enter password"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  </passwordForm.Field>
                </FieldGroup>
                <FieldGroup>
                  <passwordForm.Field name="newPassword">
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
                            autoComplete="off"
                            placeholder="Enter password"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  </passwordForm.Field>
                </FieldGroup>
                <Button
                  disabled={isUpdatingPassword}
                  type="submit"
                  form="update-password"
                  className="w-full gap-2 cursor-pointer"
                >
                  {isUpdatingPassword && <Spinner />}
                  {isUpdatingPassword ? "Loading..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Account Connections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-lg tracking-tight">GOOGLE</p>
                {connectedProviders.has("google") ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-36 cursor-pointer"
                        disabled={isUnlinkingGoogle}
                      >
                        {isUnlinkingGoogle ? (
                          <Spinner className="mr-2" />
                        ) : null}
                        Disconnect
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Disconnect Google Account?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          You will no longer be able to sign in with your Google
                          account. You&apos;ll need to use your email and
                          password or another connected account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleUnlinkGoogle}
                          className="bg-destructive cursor-pointer text-foreground hover:bg-destructive/90"
                        >
                          Disconnect
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button
                    size="sm"
                    className="w-36 cursor-pointer"
                    disabled={isLinkingGoogle}
                    onClick={handleLinkGoogle}
                  >
                    {isLinkingGoogle ? <Spinner className="mr-2" /> : null}
                    Connect
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-lg tracking-tight">GITHUB</p>
                {connectedProviders.has("github") ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-36 cursor-pointer"
                        disabled={isUnlinkingGithub}
                      >
                        {isUnlinkingGithub ? (
                          <Spinner className="mr-2" />
                        ) : null}
                        Disconnect
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Disconnect GitHub Account?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          You will no longer be able to sign in with your GitHub
                          account. You&apos;ll need to use your email and
                          password or another connected account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleUnlinkGithub}
                          className="bg-destructive cursor-pointer text-foreground hover:bg-destructive/90"
                        >
                          Disconnect
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button
                    size="sm"
                    className="w-36 cursor-pointer"
                    disabled={isLinkingGithub}
                    onClick={handleLinkGithub}
                  >
                    {isLinkingGithub ? <Spinner className="mr-2" /> : null}
                    Connect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Security & Sessions</CardTitle>
              <CardDescription>
                View and manage active sessions on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    View Active Sessions
                  </Button>
                </DialogTrigger>
                <DialogContent className="p-2 max-w-[98vw]! w-[98vw]! md:max-w-[50vw]! md:w-[50vw]! overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Your Active Sessions</DialogTitle>
                    <DialogDescription>
                      Review all devices and locations where you&apos;re
                      currently signed in
                    </DialogDescription>
                  </DialogHeader>
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {allSessions.isPending ? (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="min-h-32"
                          >
                            <div className="w-full mx-auto">
                              <Spinner className="mx-auto" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No sessions found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="border-destructive/40 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-2xl text-destructive">
                Danger Zone
              </CardTitle>
              <CardDescription className="text-destructive/80">
                Irreversible and permanent actions
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Deleting your account permanently removes your access and data
                  from our systems. This action is <strong>final</strong> and
                  cannot be undone.
                </p>

                <ul className="list-disc pl-5 space-y-1">
                  <li>Your profile and account information will be deleted</li>
                  <li>
                    All apps, projects, and associated metadata will be removed
                  </li>
                  <li>
                    Comments, upvotes, and activity history will be erased
                  </li>
                  <li>You will be immediately signed out on all devices</li>
                </ul>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full gap-2 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account Permanently
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>

                    <AlertDialogDescription className="space-y-3">
                      <p>
                        This will permanently delete your account and all
                        associated data. There is no recovery option.
                      </p>

                      <p className="font-medium text-foreground">
                        Once confirmed:
                      </p>

                      <ul className="list-disc pl-5 space-y-1">
                        <li>You will lose access immediately</li>
                        <li>All content and activity will be erased</li>
                        <li>Support cannot restore your account</li>
                      </ul>

                      <p className="pt-2 text-sm">
                        If you&apos;re unsure, consider signing out or
                        contacting support instead.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">
                      Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                      onClick={handleDeleteUser}
                      className="bg-destructive text-foreground hover:bg-destructive/90 cursor-pointer"
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
