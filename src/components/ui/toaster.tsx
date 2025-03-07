
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Heart, AlertTriangle, Bell } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        // Determine icon based on toast variant
        let Icon = Bell
        if (variant === "destructive") {
          Icon = AlertTriangle
        } else if (variant === "health") {
          Icon = Heart
        }

        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="grid gap-1">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {title && <ToastTitle>{title}</ToastTitle>}
              </div>
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
