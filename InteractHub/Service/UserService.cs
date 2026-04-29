using InteractHub.Data;
using InteractHub.DTOs.User;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.Service;

public class UserService : IUserService
{
    private readonly AppDbContext _db;

    public UserService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<UserProfileDto> GetProfileAsync(Guid userId)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new Exception("Không tìm thấy người dùng.");

        var postsCount = await _db.Posts
            .CountAsync(p => p.UserId == userId);

        var friendsCount = await _db.Friendships
            .CountAsync(f =>
                (f.RequesterId == userId || f.AddresseeId == userId)
                && f.Status == "Accepted");

        return new UserProfileDto
        {
            Id          = user.Id,
            DisplayName = user.DisplayName,
            AvatarUrl   = user.AvatarUrl,
            Bio         = user.Bio,
            UserName    = user.UserName,
            PostsCount  = postsCount,
            FriendsCount = friendsCount,
            CreatedAt   = user.CreatedAt
        };
    }

    public async Task UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new Exception("Không tìm thấy người dùng.");

        if (dto.DisplayName != null) user.DisplayName = dto.DisplayName;
        if (dto.Bio != null)         user.Bio         = dto.Bio;
        if (dto.AvatarUrl != null)   user.AvatarUrl   = dto.AvatarUrl;

        await _db.SaveChangesAsync();
    }
}