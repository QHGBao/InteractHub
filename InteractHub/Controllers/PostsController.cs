    // GET    /api/posts          → Lấy danh sách posts (có pagination)
    // GET    /api/posts/{id}     → Chi tiết 1 post
    // POST   /api/posts          → Tạo post mới
    // PUT    /api/posts/{id}     → Sửa post
    // DELETE /api/posts/{id}     → Xóa post

    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using System.Security.Claims;
    using InteractHub.Model;
    using InteractHub.Data;
    using InteractHub.DTOs.Post;

    namespace InteractHub.Controllers;
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase{
        private readonly AppDbContext _context;

        public PostsController(AppDbContext context){
            _context = context;
        }
        // GET    /api/posts 
        [HttpGet]
        public async Task<ActionResult<object>> GetPosts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Posts
                .Where(p => !p.IsDeleted) //Chỉ lấy post chưa xóa
                .Include(p => p.Author)
                .OrderByDescending(p => p.CreatedAt);
            var totalCount = await query.CountAsync();
            var posts = await query.Skip((page - 1) * pageSize).Take(pageSize).Select(p => new {
                p.Id,
                p.Content,
                p.ImageUrl,
                p.LikesCount,
                p.CommentsCount,
                Author = new{
                    p.Author.Id,
                    p.Author.UserName
                }
            }).ToListAsync();

            return Ok(new {
                posts,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }
        // GET    /api/posts/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetPost(Guid id){
            var post = await _context.Posts
                .Where(p => p.Id == id && !p.IsDeleted)
                .Include(p => p.Author)
                .Include(p => p.Comments.Where(c => !c.IsDeleted))
                    .ThenInclude(c => c.Author)
                .Include(p => p.Likes)
                    .ThenInclude(l => l.User)
                .FirstOrDefaultAsync();

            if (post == null) return NotFound(new {Message = "Post not found"});

            return Ok(new {
                post.Id,
                post.Content,
                post.ImageUrl,
                post.LikesCount,
                post.CommentsCount,
                Author = new {
                    post.Author.Id,
                    post.Author.UserName
                },
                Comments = post.Comments
                .Where(c => c.ParentCommentId == null)
                .Select(c => new {
                    c.Id,
                    c.Content,
                    c.CreatedAt,
                    Author = new {
                        c.Author.Id,
                        c.Author.UserName
                    },
                    RepliesCount = post.Comments.Count(r => r.ParentCommentId == c.Id)
                }),
                Likes = post.Likes.Select(l => new {
                    l.Id,
                    l.CreatedAt,
                })
            });
        }

        // POST /api/posts
        [HttpPost]
        public async Task<ActionResult> CreatePost([FromBody] CreatePostDto dto){
            var userId = Guid.Parse("4db5c6b3-607a-4099-692e-08de9c30adf0");
            // var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var post = new Post{
                UserId = userId,
                Content = dto.Content,
                ImageUrl = dto.ImageUrl
            };
            _context.Posts.Add(post);
            await _context.SaveChangesAsync();
            await _context.Entry(post).Reference(p => p.Author).LoadAsync();
            return CreatedAtAction(nameof(GetPost), new {id = post.Id}, new {
                post.Id,
                post.Content,
                post.ImageUrl,
                post.CreatedAt,
                Author = new{
                    post.Author.Id,
                    post.Author.UserName
                }
            });
        }

        // PUT /api/posts/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePost(Guid id, [FromBody] UpdatePostDto dto){
            var post = await _context.Posts.FindAsync(id);
            if (post == null || post.IsDeleted)
                return NotFound();
            
            post.Content = dto.Content;
            post.ImageUrl = dto.ImageUrl;
            post.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/posts/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(Guid id){
            var post = await _context.Posts.FindAsync(id);
            if (post == null || post.IsDeleted)
                return NotFound();
            
            post.IsDeleted = true;
            post.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }