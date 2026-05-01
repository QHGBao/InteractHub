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
                Id        = Guid.NewGuid(),
                Name      = n,
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
        var post = new Post
        {
            UserId    = userId,
            Content   = dto.Content,
            ImageUrl  = dto.ImageUrl,
            CreatedAt = DateTime.UtcNow
        };

        _context.Add(post);
        var tags = ParseHashtags(dto.Content);
        await UpsertHashtagsAsync(tags);

        await _context.SaveChangesAsync();
        await _context.Entry(post).Reference(p => p.Author).LoadAsync();

        return new
        {
            id            = post.Id,
            content       = post.Content,
            imageUrl      = post.ImageUrl,
            createdAt     = DateTime.SpecifyKind(post.CreatedAt, DateTimeKind.Utc).ToString("o"),
            likesCount    = post.LikesCount,
            commentsCount = post.CommentsCount,
            author = new
            {
                id          = post.Author.Id,
                userName    = post.Author.UserName,
                displayName = post.Author.DisplayName,
                avatarUrl   = post.Author.AvatarUrl
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
        var added   = newTags.Except(oldTags).ToList();

        await DecrementHashtagsAsync(removed);
        await UpsertHashtagsAsync(added);

        post.Content   = dto.Content;
        post.ImageUrl  = dto.ImageUrl;
        post.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<object> GetPosts(int page, int pageSize)
    {
        var query = _context.Posts
            .Where(p => !p.IsDeleted)
            .Include(p => p.Author)
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
            author = new
            {
                id          = p.Author.Id,
                userName    = p.Author.UserName,
                displayName = p.Author.DisplayName,
                avatarUrl   = p.Author.AvatarUrl
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

    public async Task<object?> GetPost(Guid id)
    {
        var post = await _context.Posts
            .Where(p => p.Id == id && !p.IsDeleted)
            .Include(p => p.Comments.Where(c => !c.IsDeleted))
                .ThenInclude(c => c.Author)
            .Include(p => p.Author)
            .Include(p => p.Likes)
                .ThenInclude(l => l.User)
            .FirstOrDefaultAsync();

        if (post == null) return null;

        return new
        {
            id            = post.Id,
            content       = post.Content,
            imageUrl      = post.ImageUrl,
            likesCount    = post.LikesCount,
            commentsCount = post.CommentsCount,
            createdAt     = DateTime.SpecifyKind(post.CreatedAt, DateTimeKind.Utc).ToString("o"),
            author = new
            {
                id          = post.Author.Id,
                userName    = post.Author.UserName,
                displayName = post.Author.DisplayName,
                avatarUrl   = post.Author.AvatarUrl
            },
            comments = post.Comments
                .Where(c => c.ParentCommentId == null)
                .Select(c => new
                {
                    id        = c.Id,
                    content   = c.Content,
                    createdAt = DateTime.SpecifyKind(c.CreatedAt, DateTimeKind.Utc).ToString("o"),
                    author = new
                    {
                        id          = c.Author.Id,
                        userName    = c.Author.UserName,
                        displayName = c.Author.DisplayName,
                        avatarUrl   = c.Author.AvatarUrl
                    },
                    repliesCount = post.Comments.Count(r => r.ParentCommentId == c.Id)
                }),
            likes = post.Likes.Select(l => new
            {
                id        = l.Id,
                createdAt = DateTime.SpecifyKind(l.CreatedAt, DateTimeKind.Utc).ToString("o")
            })
        };
    }

    public async Task<object> GetPostsByUser(Guid userId, int page, int pageSize)
    {
        var query = _context.Posts
            .Where(p => p.UserId == userId && !p.IsDeleted)
            .Include(p => p.Author)
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
            author = new
            {
                id          = p.Author.Id,
                userName    = p.Author.UserName,
                displayName = p.Author.DisplayName,
                avatarUrl   = p.Author.AvatarUrl
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