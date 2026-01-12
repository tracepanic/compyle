"use client";

import { columns } from "@/app/dashboard/apps/table";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { queryClient } from "@/providers/query.provider";
import {
  deleteApp,
  getDashboardApps,
  updateAppPublishStatus,
} from "@/server/app";
import { AppPublishStatus } from "@/types/app";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CirclePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();

  const { isPending, data } = useQuery({
    queryKey: ["me-dashboard-apps"],
    queryFn: getDashboardApps,
    meta: { showError: true },
  });

  const deleteAppMutation = useMutation({
    mutationFn: (appId: string) => deleteApp({ appId }),
    onMutate: () => {
      return toast.loading("Deleting app...");
    },
    onSuccess: (_, __, toastId) => {
      toast.dismiss(toastId);
      toast.success("App deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["me-dashboard-apps"] });
    },
    onError: (_, __, toastId) => {
      toast.dismiss(toastId);
      toast.error("Failed to delete app.");
    },
  });

  const updatePublishStatusMutation = useMutation({
    mutationFn: ({
      appId,
      newStatus,
    }: {
      appId: string;
      newStatus: AppPublishStatus;
    }) => updateAppPublishStatus({ appId, newStatus }),
    onMutate: () => {
      return toast.loading("Updating app status...");
    },
    onSuccess: (_, __, toastId) => {
      toast.dismiss(toastId);
      toast.success("App status updated");
      queryClient.invalidateQueries({ queryKey: ["me-dashboard-apps"] });
    },
    onError: (_, __, toastId) => {
      toast.dismiss(toastId);
      toast.error("Failed to update app status.");
    },
  });

  const handleUpdateStatus = ({
    appId,
    status,
  }: {
    appId: string;
    status: AppPublishStatus;
  }) => {
    updatePublishStatusMutation.mutate({ appId, newStatus: status });
  };

  const handleDeleteApp = (appId: string) => {
    deleteAppMutation.mutate(appId);
  };

  const columnWithHandler = columns(
    handleUpdateStatus,
    handleDeleteApp,
    deleteAppMutation.isPending
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns: columnWithHandler,
    data: data ?? [],
    getCoreRowModel: getCoreRowModel(),
  });

  const navigateToView = (id: string) => {
    router.push(`/dashboard/apps/${id}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Apps</h1>
        <Link
          href="/dashboard/apps/new"
          className={buttonVariants({ variant: "default" })}
        >
          <CirclePlus className="h-4 w-4" /> Submit New App
        </Link>
      </div>

      <Table className="mt-6">
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
          {isPending ? (
            <TableRow>
              <TableCell
                colSpan={columnWithHandler.length}
                className="min-h-32"
              >
                <div className="w-full mx-auto">
                  <Spinner className="mx-auto" />
                </div>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                className="cursor-pointer"
                key={row.id}
                onClick={() => navigateToView(row.original.app.id)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columnWithHandler.length}
                className="h-24 text-center text-muted-foreground"
              >
                No submitted apps found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
