import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface NotificationListProps {
  onNotificationClick?: () => void;
}

export function NotificationList({ onNotificationClick }: NotificationListProps) {
  const { notifications, isLoading, markAsRead, acceptRoleInvitation, rejectRoleInvitation } = useNotifications();

  if (isLoading) {
    return <div className="text-center py-8">لوڈ ہو رہا ہے...</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>کوئی نوٹیفیکیشن نہیں ہے</p>
      </div>
    );
  }

  const handleAccept = async (pendingRoleId: string, role: string, notificationId: string) => {
    await acceptRoleInvitation.mutateAsync({ pendingRoleId, role });
    await markAsRead.mutateAsync(notificationId);
    onNotificationClick?.();
  };

  const handleReject = async (pendingRoleId: string, notificationId: string) => {
    await rejectRoleInvitation.mutateAsync(pendingRoleId);
    await markAsRead.mutateAsync(notificationId);
    onNotificationClick?.();
  };

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Card 
          key={notification.id} 
          className={`${!notification.read ? 'border-primary/50 bg-primary/5' : 'border-border'}`}
        >
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(notification.created_at), { 
                      addSuffix: true,
                      locale: ar 
                    })}
                  </p>
                </div>
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                )}
              </div>

              {notification.type === "role_assignment" && notification.data?.pending_role_id && (
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1"
                    onClick={() => handleAccept(
                      notification.data!.pending_role_id!,
                      notification.data!.role!,
                      notification.id
                    )}
                    disabled={acceptRoleInvitation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    قبول کریں
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleReject(
                      notification.data!.pending_role_id!,
                      notification.id
                    )}
                    disabled={rejectRoleInvitation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    رد کریں
                  </Button>
                </div>
              )}

              {notification.read && (
                <p className="text-xs text-muted-foreground mt-2 italic">پڑھ لیا گیا</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
