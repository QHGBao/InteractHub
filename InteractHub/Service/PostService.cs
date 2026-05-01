using InteractHub.Data;
using InteractHub.DTOs.Post;
using InteractHub.Model;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace InteractHub.Service;

public class PostService : IPostService
{
    public readonly AppDbContext _context;

    public PostService(AppDbContext context)
    {
        _context = context;
    }
    private static List<string> ParseHashtags(string? content)
    {
        if (string.IsNullOrWhiteSpace(content)) return [];

        return Regex.Matches(content, @"#(\w+)")
                    .Select(m => m.Groups[1].Value.ToLower())
                    .Distinct()
                    .ToList();
    }
    private async Task UpsertHashtagsAsync(List<string> names)
    {
        if (names.Count == 0) return;

        var existing = await _context.Hashtags
            .Where(h => names.Contains(h.Name!.ToLower()))
            .ToListAsync();

        var existingNames = existing.Select(h => h.Name!.ToLower()).ToHashSet();

        foreach (var hashtag in existing)
            hashtag.PostCount++;
        var newHashtags = names
            .Where(n => !existingNames.Contains(n))
            .Select(n => new Hashtag
            {
                Id = Guid.NewGuid(),
                Name = n,
                PostCount = 1
            });

        _context.Hashtags.AddRange(newHashtags);
    }

    private async Task DecrementHashtagsAsync(List<string> names)
    {
        if (names.Count == 0) return;

        var hashtags = await _context.Hashtags
            .Where(h => names.Contains(h.Name!.ToLower()))
            .ToListAsync();

        foreach (var hashtag in hashtags)
            hashtag.PostCount = Math.Max(0, hashtag.PostCount - 1);
    }

    public async Task<object> CreatePost(Guid userId, CreatePostDto dto)
    {
        // Validate shared post nếu có
        Post? sharedPost = null;
        if (dto.SharedPostId.HasValue)
        {
            sharedPost = await _context.Posts
                .Include(p => p.Author)
                .FirstOrDefaultAsync(p => p.Id == dto.SharedPostId.Value && !p.IsDeleted);
            if (sharedPost == null)
                throw new Exception("Bài viết gốc không tồn tại hoặc đã bị xóa.");
        }

        var post = new Post
        {
            UserId = userId,
            Content = dto.Content,
            ImageUrl = dto.ImageUrl,
            SharedPostId = dto.SharedPostId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Add(post);
        var tags = ParseHashtags(dto.Content);
        await UpsertHashtagsAsync(tags);
        await _context.SaveChangesAsync();
        await _context.Entry(post).Reference(p => p.Author).LoadAsync();

        return new
        {
            id = post.Id,
            content = post.Content,
            imageUrl = post.ImageUrl,
            createdAt = DateTime.SpecifyKind(post.CreatedAt, DateTimeKind.Utc).ToString("o"),
            likesCount = post.LikesCount,
            commentsCount = post.CommentsCount,
            author = new
            {
                id = post.Author.Id,
                userName = post.Author.UserName,
                displayName = post.Author.DisplayName,
                avatarUrl = post.Author.AvatarUrl
            },
            sharedPost = sharedPost == null ? null : new   // trả về embedded post
            {
                id = sharedPost.Id,
                content = sharedPost.Content,
                imageUrl = sharedPost.ImageUrl,
                createdAt = DateTime.SpecifyKind(sharedPost.CreatedAt, DateTimeKind.Utc).ToString("o"),
                author = new
                {
                    id = sharedPost.Author.Id,
                    userName = sharedPost.Author.UserName,
                    displayName = sharedPost.Author.DisplayName,
                    avatarUrl = sharedPost.Author.AvatarUrl
                }
            }
        };
    }

    public async Task<bool> DeletePost(Guid userId, Guid postId)
    {
        var post = await _context.Posts.FindAsync(postId);
        if (post == null || post.IsDeleted || userId != post.UserId)
            return false;

        post.IsDeleted = true;
        post.UpdatedAt = DateTime.UtcNow;

        var tags = ParseHashtags(post.Content);
        await DecrementHashtagsAsync(tags);

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdatePost(Guid userId, Guid postId, UpdatePostDto dto)
    {
        var post = await _context.Posts.FindAsync(postId);
        if (post == null || post.IsDeleted || userId != post.UserId)
            return false;

        var oldTags = ParseHashtags(post.Content);
        var newTags = ParseHashtags(dto.Content);

        var removed = oldTags.Except(newTags).ToList();
        var added = newTags.Except(oldTags).ToList();

        await DecrementHashtagsAsync(removed);
        await UpsertHashtagsAsync(added);

        post.Content = dto.Content;
        post.ImageUrl = dto.ImageUrl;
        post.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<object> GetPosts(Guid? currentUserId, int page, int pageSize)
    {
        var query = _context.Posts
            .Where(p => !p.IsDeleted)
            .Include(p => p.Author)
            .Include(p => p.Likes)
            .Include(p => p.SharedPost)
                .ThenInclude(sp => sp!.Author)
            .OrderByDescending(c => c.CreatedAt);

        var totalCount = await query.CountAsync();

        var posts = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var formattedPosts = posts.Select(p => new
        {
            p.Id,
            p.Content,
            p.ImageUrl,
            p.LikesCount,
            p.CommentsCount,
            createdAt = DateTime.SpecifyKind(p.CreatedAt, DateTimeKind.Utc).ToString("o"),
            isLikedByCurrentUser = currentUserId.HasValue && p.Likes.Any(l => l.UserId == currentUserId.Value),
            author = new
            {
                id = p.Author.Id,
                userName = p.Author.UserName,
                displayName = p.Author.DisplayName,
                avatarUrl = p.Author.AvatarUrl
            },
            sharedPost = p.SharedPost == null ? null : new  // thêm
            {
                id = p.SharedPost.Id,
                content = p.SharedPost.Content,
                imageUrl = p.SharedPost.ImageUrl,
                createdAt = DateTime.SpecifyKind(p.SharedPost.CreatedAt, DateTimeKind.Utc).ToString("o"),
                author = new
                {
                    id = p.SharedPost.Author.Id,
                    userName = p.SharedPost.Author.UserName,
                    displayName = p.SharedPost.Author.DisplayName,
                    avatarUrl = p.SharedPost.Author.AvatarUrl
                }
            }
        }).ToList();

        return new
        {
            posts = formattedPosts,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    public async Task<object?> GetPost(Guid id, Guid? currentUserId)
    {
        var post = await _context.Posts
            .Where(p => p.Id == id && !p.IsDeleted)
            .Include(p => p.Comments.Where(c => !c.IsDeleted))
                .ThenInclude(c => c.Author)
            .Include(p => p.Author)
            .Include(p => p.Likes)
            .Include(p => p.SharedPost)
                .ThenInclude(sp => sp!.Author)
            .FirstOrDefaultAsync();

        if (post == null) return null;

        return new
        {
            id = post.Id,
            content = post.Content,
            imageUrl = post.ImageUrl,
            likesCount = post.LikesCount,
            commentsCount = post.CommentsCount,
            createdAt = DateTime.SpecifyKind(post.CreatedAt, DateTimeKind.Utc).ToString("o"),

            isLikedByCurrentUser =
                currentUserId.HasValue &&
                post.Likes.Any(l => l.UserId == currentUserId.Value),

            author = new
            {
                id = post.Author.Id,
                userName = post.Author.UserName,
                displayName = post.Author.DisplayName,
                avatarUrl = post.Author.AvatarUrl
            },
            sharedPost = post.SharedPost == null ? null : new
            {
                id = post.SharedPost.Id,
                content = post.SharedPost.Content,
                imageUrl = post.SharedPost.ImageUrl,
                createdAt = DateTime.SpecifyKind(post.SharedPost.CreatedAt, DateTimeKind.Utc).ToString("o"),
                author = new
                {
                    id = post.SharedPost.Author.Id,
                    userName = post.SharedPost.Author.UserName,
                    displayName = post.SharedPost.Author.DisplayName,
                    avatarUrl = post.SharedPost.Author.AvatarUrl
                }
            },

            comments = post.Comments
                .Where(c => c.ParentCommentId == null)
                .Select(c => new
                {
                    id = c.Id,
                    content = c.Content,
                    createdAt = DateTime.SpecifyKind(c.CreatedAt, DateTimeKind.Utc).ToString("o"),
                    author = new
                    {
                        id = c.Author.Id,
                        userName = c.Author.UserName,
                        displayName = c.Author.DisplayName,
                        avatarUrl = c.Author.AvatarUrl
                    },
                    repliesCount = post.Comments.Count(r => r.ParentCommentId == c.Id)
                }),

            likes = post.Likes.Select(l => new
            {
                id = l.Id,
                createdAt = DateTime.SpecifyKind(l.CreatedAt, DateTimeKind.Utc).ToString("o")
            })
        };
    }
    public async Task<object> GetPostsByUser(Guid? userId, int page, int pageSize)
    {
        var query = _context.Posts
            .Where(p => p.UserId == userId && !p.IsDeleted)
            .Include(p => p.Author)
            .Include(p => p.Likes)
            .Include(p => p.SharedPost)
                .ThenInclude(sp => sp!.Author)
            .OrderByDescending(p => p.CreatedAt);

        var totalCount = await query.CountAsync();

        var posts = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var formattedPosts = posts.Select(p => new
        {
            p.Id,
            p.Content,
            p.ImageUrl,
            p.LikesCount,
            p.CommentsCount,
            createdAt = DateTime.SpecifyKind(p.CreatedAt, DateTimeKind.Utc).ToString("o"),
            isLikedByCurrentUser = userId.HasValue && p.Likes.Any(l => l.UserId == userId.Value),
            author = new
            {
                id = p.Author.Id,
                userName = p.Author.UserName,
                displayName = p.Author.DisplayName,
                avatarUrl = p.Author.AvatarUrl
            },

            // shared post
            sharedPost = p.SharedPost == null ? null : new
            {
                id = p.SharedPost.Id,
                content = p.SharedPost.Content,
                imageUrl = p.SharedPost.ImageUrl,
                createdAt = DateTime.SpecifyKind(p.SharedPost.CreatedAt, DateTimeKind.Utc).ToString("o"),
                author = new
                {
                    id = p.SharedPost.Author.Id,
                    userName = p.SharedPost.Author.UserName,
                    displayName = p.SharedPost.Author.DisplayName,
                    avatarUrl = p.SharedPost.Author.AvatarUrl
                }
            }
        }).ToList();

        return new
        {
            posts = formattedPosts,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }
}