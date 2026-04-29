using InteractHub.DTOs;

namespace InteractHub.Service;

public interface INotificationService
{
    Task<List<NotificationDto>> GetNotificationsAsync(Guid userId);
    Task<int> GetUnreadCountAsync(Guid userId);
    Task MarkAsReadAsync(Guid notificationId, Guid userId);
    Task MarkAllAsReadAsync(Guid userId);

    // Tạo thông báo VÀ gửi real-time qua SignalR
    Task CreateAndSendAsync(Guid userId, Guid? actorId, string type, string message, Guid? referenceId = null);
}