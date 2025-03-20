"use client"

import { Toast, ToastClose, ToastDescription, ToastTitle } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

import { ToastProps } from "@/components/ui/toast"
  const { toasts } = useToast<ToastItem>()
interface ToastItem extends ToastProps {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(({ id, title, description, action, ...props }: ToastItem) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
    </div>
  )
}

