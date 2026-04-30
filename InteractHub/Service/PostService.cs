using InteractHub.Data;
using InteractHub.DTOs.Post;
using InteractHub.Model;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.Service;
public class PostService : IPostService
{
    public readonly AppDbContext _context;
    public PostService(AppDbContext context)
    {
        _context = context;
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
            .Select(p => new
            {
                p.Id,
                p.Content,
                p.ImageUrl,
                p.LikesCount,
                p.CommentsCount,
                createdAt = p.CreatedAt.ToString("o"),
                author = new
                {
                    id = p.Author.Id,
                    userName = p.Author.UserName
                }
            })
            .ToListAsync();

        return new
        {
            posts,
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
        if (post == null)
        {
            return null;
        }
        return new
        {
            id = post.Id,
            content = post.Content,
            image = post.ImageUrl,
            likesCount = post.LikesCount,
            commentsCount = post.CommentsCount,
            createdAt = post.CreatedAt.ToString("o"),
            author = new
            {
                id = post.Author.Id,
                userName = post.Author.UserName
            },
            comments = post.Comments
                .Where(c => c.ParentCommentId == null)
                .Select(c => new
                {
                    id = c.Id,
                    content = c.Content,
                    createdAt = c.CreatedAt.ToString("o"),
                    author = new
                    {
                        id = c.Author.Id,
                        userName = c.Author.UserName
                    },
                    repliesCount = post.Comments.Count(r => r.ParentCommentId == c.Id)
                }),
            likes = post.Likes.Select(l => new
            {
                id = l.Id,
                createdAt = l.CreatedAt.ToString("o")
            })
        };
    }

    public async Task<object> CreatePost(Guid userId, CreatePostDto dto)
    {
        var post = new Post
        {
            UserId = userId,
            Content = dto.Content,
            ImageUrl = dto.ImageUrl,
            CreatedAt = DateTime.UtcNow
        };
        _context.Add(post);
        await _context.SaveChangesAsync();
        await _context.Entry(post).Reference(p => p.Author).LoadAsync();
        return new
        {
            id = post.Id,
            content = post.Content,
            imageUrl = post.ImageUrl,
            createdAt = post.CreatedAt.ToString("o"),
            likesCount = post.LikesCount,
            commentsCount = post.CommentsCount,
            author = new
            {
                id = post.Author.Id,
                userName = post.Author.UserName
            }
        };
    }

    public async Task<bool> UpdatePost(Guid userId, Guid postId, UpdatePostDto dto)
    {
        var post = await _context.Posts.FindAsync(postId);
        if (post == null || post.IsDeleted || userId != post.UserId)
            return false;

        post.Content = dto.Content;
        post.ImageUrl = dto.ImageUrl;
        post.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeletePost(Guid userId, Guid postId)
    {
        var post = await _context.Posts.FindAsync(postId);
        if (post == null || post.IsDeleted || userId != post.UserId)
            return false;

        post.IsDeleted = true;
        post.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
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
            .Select(p => new
            {
                p.Id,
                p.Content,
                p.ImageUrl,
                p.LikesCount,
                p.CommentsCount,
                createdAt = p.CreatedAt.ToString("o"),
                author = new
                {
                    id       = p.Author.Id,
                    userName = p.Author.UserName
                }
            })
            .ToListAsync();

        return new
        {
            posts,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }
}