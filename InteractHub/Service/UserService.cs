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

    var postsCount = await _db.Posts.CountAsync(p => p.UserId == userId);
    var friendsCount = await _db.Friendships.CountAsync(f =>
        (f.RequesterId == userId || f.AddresseeId == userId) && f.Status == "Accepted");

    return new UserProfileDto
    {
        Id           = user.Id,
        DisplayName  = user.DisplayName,
        AvatarUrl    = user.AvatarUrl,
        CoverUrl     = user.CoverUrl,
        Bio          = user.Bio,
        UserName     = user.UserName,
        School       = user.School,
        Gender       = user.Gender,
        SocialLinks  = user.SocialLinks,
        PostsCount   = postsCount,
        FriendsCount = friendsCount,
        CreatedAt    = user.CreatedAt
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
    if (dto.CoverUrl != null)    user.CoverUrl    = dto.CoverUrl;
    if (dto.School != null)      user.School      = dto.School;
    if (dto.Gender != null)      user.Gender      = dto.Gender;
    if (dto.SocialLinks != null) user.SocialLinks = dto.SocialLinks;

    await _db.SaveChangesAsync();
}
}