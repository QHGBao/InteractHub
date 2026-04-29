using InteractHub.DTOs.Friend;

namespace InteractHub.Service;

public interface IFriendService
{
    Task<List<FriendResponseDto>> GetFriendsAsync(Guid userId);
    Task<List<FriendResponseDto>> GetFriendRequestsAsync(Guid userId);
    Task<List<FriendResponseDto>> GetSuggestionsAsync(Guid userId);
    Task SendFriendRequestAsync(Guid requesterId, Guid addresseeId);
    Task AcceptFriendRequestAsync(Guid userId, Guid friendshipId);
    Task RejectFriendRequestAsync(Guid userId, Guid friendshipId);
    Task UnfriendAsync(Guid userId, Guid friendId);
}