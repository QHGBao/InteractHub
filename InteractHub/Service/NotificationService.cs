using InteractHub.Data;
using InteractHub.DTOs;
using InteractHub.Hubs;
using InteractHub.Model;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.Service;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(AppDbContext context, IHubContext<NotificationHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<List<NotificationDto>> GetNotificationsAsync(Guid userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Include(n => n.Actor)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                UserId = n.UserId, // ✅ thêm
                Type = n.Type,
                Message = n.Message,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                ReferenceId = n.ReferenceId,
                Actor = n.Actor == null ? null : new ActorDto
                {
                    Id = n.Actor.Id,
                    DisplayName = n.Actor.DisplayName,
                    AvatarUrl = n.Actor.AvatarUrl
                }
            })
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task MarkAsReadAsync(Guid notificationId, Guid userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null)
            throw new Exception("Thông báo không tồn tại");

        notification.IsRead = true;
        await _context.SaveChangesAsync();
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var n in notifications)
            n.IsRead = true;

        await _context.SaveChangesAsync();
    }

    public async Task CreateAndSendAsync(
        Guid userId, Guid? actorId, string type,
        string message, Guid? referenceId = null)
    {
        // 1. Lưu vào database
        var notification = new Notification
        {
            UserId = userId,
            ActorId = actorId,
            Type = type,
            Message = message,
            ReferenceId = referenceId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        // 2. Gửi real-time qua SignalR đến đúng người nhận
        var dto = new NotificationDto
        {
            Id = notification.Id,
            UserId = userId, // ✅ thêm
            Type = type,
            Message = message,
            IsRead = false,
            CreatedAt = notification.CreatedAt,
            ReferenceId = referenceId
        };

        await _hubContext.Clients
            .Group(userId.ToString())
            .SendAsync("ReceiveNotification", dto);
    }
}