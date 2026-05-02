using InteractHub.Data;
using InteractHub.DTOs.Friend;
using InteractHub.Model;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.Service;

public class FriendService : IFriendService
{
    private readonly AppDbContext _db;
    private readonly INotificationService _notificationService;

    public FriendService(AppDbContext db, INotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    // Danh sách bạn bè (Status = Accepted)
    public async Task<List<FriendResponseDto>> GetFriendsAsync(Guid userId)
    {
        var friendships = await _db.Friendships
            .Include(f => f.Requester)
            .Include(f => f.Addressee)
            .Where(f => (f.RequesterId == userId || f.AddresseeId == userId)
                        && f.Status == "Accepted")
            .ToListAsync();

        return friendships.Select(f =>
        {
            // Lấy thông tin người kia (không phải mình)
            var friend = f.RequesterId == userId ? f.Addressee : f.Requester;
            return new FriendResponseDto
            {
                FriendshipId = f.Id,
                UserId = friend.Id,
                DisplayName = friend.DisplayName,
                AvatarUrl = friend.AvatarUrl,
                Status = f.Status,
                CreatedAt = f.CreatedAt
            };
        }).ToList();
    }

    // Lời mời đang chờ (người khác gửi cho mình)
    public async Task<List<FriendResponseDto>> GetFriendRequestsAsync(Guid userId)
    {
        var requests = await _db.Friendships
            .Include(f => f.Requester)
            .Where(f => f.AddresseeId == userId && f.Status == "Pending")
            .ToListAsync();

        return requests.Select(f => new FriendResponseDto
        {
            FriendshipId = f.Id,
            UserId = f.Requester.Id,
            DisplayName = f.Requester.DisplayName,
            AvatarUrl = f.Requester.AvatarUrl,
            Status = f.Status,
            CreatedAt = f.CreatedAt
        }).ToList();
    }

    // Gợi ý kết bạn (người chưa có quan hệ gì với mình)
    public async Task<List<FriendResponseDto>> GetSuggestionsAsync(Guid userId)
    {
        // Lấy tất cả Id đã có quan hệ
        var relatedIds = await _db.Friendships
            .Where(f => f.RequesterId == userId || f.AddresseeId == userId)
            .Select(f => f.RequesterId == userId ? f.AddresseeId : f.RequesterId)
            .ToListAsync();

        relatedIds.Add(userId); // loại luôn bản thân

        var suggestions = await _db.Users
            .Where(u => !relatedIds.Contains(u.Id) && u.IsActive)
            .Take(10)
            .ToListAsync();

        return suggestions.Select(u => new FriendResponseDto
        {
            FriendshipId = Guid.Empty,
            UserId = u.Id,
            DisplayName = u.DisplayName,
            AvatarUrl = u.AvatarUrl,
            Status = "None",
            CreatedAt = DateTime.UtcNow
        }).ToList();
    }

    // Gửi lời mời kết bạn
    public async Task SendFriendRequestAsync(Guid requesterId, Guid addresseeId)
    {
        // Kiểm tra đã có quan hệ chưa
        var exists = await _db.Friendships.AnyAsync(f =>
            (f.RequesterId == requesterId && f.AddresseeId == addresseeId) ||
            (f.RequesterId == addresseeId && f.AddresseeId == requesterId));

        if (exists)
            throw new Exception("Đã tồn tại quan hệ bạn bè hoặc lời mời.");

        _db.Friendships.Add(new Friendship
        {
            RequesterId = requesterId,
            AddresseeId = addresseeId,
            Status = "Pending"
        });

        await _db.SaveChangesAsync();

        // Lấy tên người gửi để hiển thị trong thông báo
        var requester = await _db.Users.FindAsync(requesterId);

        // Gửi thông báo real-time cho người nhận
        await _notificationService.CreateAndSendAsync(
            userId: addresseeId,
            actorId: requesterId,
            type: "FriendRequest",
            message: $"{requester?.DisplayName} đã gửi lời mời kết bạn cho bạn"
        );
    }

    // Chấp nhận lời mời
    public async Task AcceptFriendRequestAsync(Guid userId, Guid friendshipId)
    {
        var friendship = await _db.Friendships
            .FirstOrDefaultAsync(f => f.Id == friendshipId && f.AddresseeId == userId)
            ?? throw new Exception("Không tìm thấy lời mời.");

        friendship.Status = "Accepted";
        friendship.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        // Thông báo cho người gửi lời mời biết đã được chấp nhận
        var accepter = await _db.Users.FindAsync(userId);

        await _notificationService.CreateAndSendAsync(
            userId: friendship.RequesterId,
            actorId: userId,
            type: "FriendAccepted",
            message: $"{accepter?.DisplayName} đã chấp nhận lời mời kết bạn của bạn"
        );
    }

    // Từ chối / xóa lời mời
    public async Task RejectFriendRequestAsync(Guid userId, Guid friendshipId)
    {
        var friendship = await _db.Friendships
            .FirstOrDefaultAsync(f => f.Id == friendshipId && f.AddresseeId == userId)
            ?? throw new Exception("Không tìm thấy lời mời.");

        _db.Friendships.Remove(friendship);
        await _db.SaveChangesAsync();
    }

    // Hủy kết bạn
    public async Task UnfriendAsync(Guid userId, Guid friendId)
    {
        var friendship = await _db.Friendships
            .FirstOrDefaultAsync(f =>
                (f.RequesterId == userId && f.AddresseeId == friendId) ||
                (f.RequesterId == friendId && f.AddresseeId == userId))
            ?? throw new Exception("Không tìm thấy quan hệ bạn bè.");

        _db.Friendships.Remove(friendship);
        await _db.SaveChangesAsync();
    }


}