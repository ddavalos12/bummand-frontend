"use client";

import * as React from "react";
import { AlertDialog as PrimitivoAlertDialog } from "@base-ui/react/alert-dialog";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

function AlertDialog({ ...propiedades }: PrimitivoAlertDialog.Root.Props) {
  return <PrimitivoAlertDialog.Root data-slot="alert-dialog" {...propiedades} />;
}

function AlertDialogTrigger({
  asChild,
  children,
  render,
  ...propiedades
}: PrimitivoAlertDialog.Trigger.Props & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return (
      <PrimitivoAlertDialog.Trigger
        data-slot="alert-dialog-trigger"
        render={children}
        {...propiedades}
      />
    );
  }
  return (
    <PrimitivoAlertDialog.Trigger
      data-slot="alert-dialog-trigger"
      render={render}
      {...propiedades}
    >
      {children}
    </PrimitivoAlertDialog.Trigger>
  );
}

function AlertDialogPortal({ ...propiedades }: PrimitivoAlertDialog.Portal.Props) {
  return <PrimitivoAlertDialog.Portal data-slot="alert-dialog-portal" {...propiedades} />;
}

function AlertDialogOverlay({
  className,
  ...propiedades
}: PrimitivoAlertDialog.Backdrop.Props) {
  return (
    <PrimitivoAlertDialog.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/40 duration-150 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...propiedades}
    />
  );
}

function AlertDialogContent({
  className,
  children,
  ...propiedades
}: PrimitivoAlertDialog.Popup.Props) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <PrimitivoAlertDialog.Popup
        data-slot="alert-dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl bg-white p-6 text-sm text-[#122029] shadow-xl border border-[#E3DCCB] duration-150 outline-none sm:max-w-md data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...propiedades}
      >
        {children}
      </PrimitivoAlertDialog.Popup>
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...propiedades
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...propiedades}
    />
  );
}

function AlertDialogFooter({
  className,
  ...propiedades
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2",
        className
      )}
      {...propiedades}
    />
  );
}

function AlertDialogTitle({
  className,
  ...propiedades
}: PrimitivoAlertDialog.Title.Props) {
  return (
    <PrimitivoAlertDialog.Title
      data-slot="alert-dialog-title"
      className={cn("font-display text-base font-bold text-[#063A6B] leading-snug", className)}
      {...propiedades}
    />
  );
}

function AlertDialogDescription({
  className,
  ...propiedades
}: PrimitivoAlertDialog.Description.Props) {
  return (
    <PrimitivoAlertDialog.Description
      data-slot="alert-dialog-description"
      className={cn("text-xs text-[#5B6D77] font-body leading-relaxed", className)}
      {...propiedades}
    />
  );
}

function AlertDialogAction({
  className,
  children,
  asChild,
  render,
  ...propiedades
}: PrimitivoAlertDialog.Close.Props & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return (
      <PrimitivoAlertDialog.Close
        data-slot="alert-dialog-action"
        render={children}
        {...propiedades}
      />
    );
  }
  return (
    <PrimitivoAlertDialog.Close
      data-slot="alert-dialog-action"
      render={
        render ?? (
          <Button
            className={cn(
              "h-10 px-4 rounded-xl font-semibold text-xs bg-[#063A6B] hover:bg-[#063A6B]/90 text-white shadow-sm transition-all",
              className
            )}
          />
        )
      }
      {...propiedades}
    >
      {children}
    </PrimitivoAlertDialog.Close>
  );
}

function AlertDialogCancel({
  className,
  children,
  asChild,
  render,
  ...propiedades
}: PrimitivoAlertDialog.Close.Props & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return (
      <PrimitivoAlertDialog.Close
        data-slot="alert-dialog-cancel"
        render={children}
        {...propiedades}
      />
    );
  }
  return (
    <PrimitivoAlertDialog.Close
      data-slot="alert-dialog-cancel"
      render={
        render ?? (
          <Button
            variant="outline"
            className={cn(
              "h-10 px-4 rounded-xl font-semibold text-xs border-[#E3DCCB] text-[#5B6D77] hover:bg-slate-50 transition-all",
              className
            )}
          />
        )
      }
      {...propiedades}
    >
      {children}
    </PrimitivoAlertDialog.Close>
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
