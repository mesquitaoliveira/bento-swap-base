import React from "react";
import {
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Loader2,
  LucideIcon,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { cn } from "@shared/lib/utils";

export type NotificationType =
  | "info"
  | "warning"
  | "error"
  | "success"
  | "loading";

interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost";
  disabled?: boolean;
}

interface NotificationCardProps {
  type: NotificationType;
  title: string;
  description?: string;
  children?: React.ReactNode;
  actions?: NotificationAction[];
  icon?: LucideIcon;
  className?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

const getNotificationConfig = (type: NotificationType) => {
  const configs = {
    info: {
      variant: "default" as const,
      icon: Info,
      className: "border-blue-200 bg-blue-50 text-blue-900",
      iconClassName: "text-blue-600",
    },
    warning: {
      variant: "default" as const,
      icon: AlertTriangle,
      className: "border-yellow-200 bg-yellow-50 text-yellow-900",
      iconClassName: "text-yellow-600",
    },
    error: {
      variant: "destructive" as const,
      icon: AlertCircle,
      className: "",
      iconClassName: "",
    },
    success: {
      variant: "default" as const,
      icon: CheckCircle,
      className: "border-green-200 bg-green-50 text-green-900",
      iconClassName: "text-green-600",
    },
    loading: {
      variant: "default" as const,
      icon: Loader2,
      className: "border-blue-200 bg-blue-50 text-blue-900",
      iconClassName: "text-blue-600 animate-spin",
    },
  };

  return configs[type];
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  type,
  title,
  description,
  children,
  actions,
  icon: CustomIcon,
  className,
  onClose,
  showCloseButton = false,
}) => {
  const config = getNotificationConfig(type);
  const IconComponent = CustomIcon || config.icon;

  return (
    <Alert variant={config.variant} className={cn(config.className, className)}>
      <IconComponent className={cn("h-4 w-4", config.iconClassName)} />

      <div className="flex-1">
        <AlertTitle className="flex items-center justify-between">
          {title}
          {showCloseButton && onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 opacity-70 hover:opacity-100"
              onClick={onClose}
            >
              ×
            </Button>
          )}
        </AlertTitle>

        {description && (
          <AlertDescription className="mt-2">{description}</AlertDescription>
        )}

        {children && <div className="mt-3">{children}</div>}

        {actions && actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
                className="text-xs h-6 px-2"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Alert>
  );
};
