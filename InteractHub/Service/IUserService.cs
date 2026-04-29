using InteractHub.DTOs.User;

namespace InteractHub.Service;

public interface IUserService
{
    Task<UserProfileDto> GetProfileAsync(Guid userId);
    Task UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
}