using InteractHub.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Khai báo các bảng
    public DbSet<Post>         Posts         { get; set; }
    public DbSet<Comment>      Comments      { get; set; }
    public DbSet<Like>         Likes         { get; set; }
    public DbSet<Friendship>   Friendships   { get; set; }
    public DbSet<Story>        Stories       { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Hashtag>      Hashtags      { get; set; }
    public DbSet<PostHashtag>  PostHashtags  { get; set; }
    public DbSet<UserHashtag>  UserHashtags  { get; set; }
    public DbSet<PostReport>   PostReports   { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // ── Đổi tên bảng Identity cho gọn ──────────────────────
        builder.Entity<ApplicationUser>().ToTable("Users");
        builder.Entity<IdentityRole<Guid>>().ToTable("Roles");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles");
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");

        // ── Post ────────────────────────────────────────────────
        builder.Entity<Post>(e =>
        {
            // Soft delete: tự động lọc bài đã xóa
            e.HasQueryFilter(p => !p.IsDeleted);

            e.HasOne(p => p.Author)
             .WithMany(u => u.Posts)
             .HasForeignKey(p => p.UserId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Comment ─────────────────────────────────────────────
        builder.Entity<Comment>(e =>
        {
            e.HasQueryFilter(c => !c.IsDeleted);

            e.HasOne(c => c.Post)
             .WithMany(p => p.Comments)
             .HasForeignKey(c => c.PostId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(c => c.Author)
             .WithMany(u => u.Comments)
             .HasForeignKey(c => c.UserId)
             .OnDelete(DeleteBehavior.Restrict);

            // Self-referencing: reply lồng nhau
            e.HasOne(c => c.ParentComment)
             .WithMany(c => c.Replies)
             .HasForeignKey(c => c.ParentCommentId)
             .OnDelete(DeleteBehavior.Restrict)
             .IsRequired(false);
        });

        // ── Like ────────────────────────────────────────────────
        builder.Entity<Like>(e =>
        {
            // 1 user chỉ like 1 bài 1 lần
            e.HasIndex(l => new { l.UserId, l.PostId }).IsUnique();

            e.HasOne(l => l.User)
             .WithMany(u => u.Likes)
             .HasForeignKey(l => l.UserId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(l => l.Post)
             .WithMany(p => p.Likes)
             .HasForeignKey(l => l.PostId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Friendship ──────────────────────────────────────────
        builder.Entity<Friendship>(e =>
        {
            // Mỗi cặp user chỉ có 1 quan hệ
            e.HasIndex(f => new { f.RequesterId, f.AddresseeId }).IsUnique();

            e.HasOne(f => f.Requester)
             .WithMany(u => u.SentFriendRequests)
             .HasForeignKey(f => f.RequesterId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(f => f.Addressee)
             .WithMany(u => u.ReceivedFriendRequests)
             .HasForeignKey(f => f.AddresseeId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Story ───────────────────────────────────────────────
        builder.Entity<Story>(e =>
        {
            e.HasOne(s => s.Author)
             .WithMany(u => u.Stories)
             .HasForeignKey(s => s.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Notification ────────────────────────────────────────
        builder.Entity<Notification>(e =>
        {
            e.HasOne(n => n.Recipient)
             .WithMany(u => u.Notifications)
             .HasForeignKey(n => n.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            // ActorId nullable — thông báo có thể từ hệ thống
            e.HasOne(n => n.Actor)
             .WithMany()
             .HasForeignKey(n => n.ActorId)
             .OnDelete(DeleteBehavior.Restrict)
             .IsRequired(false);
        });

        // ── Hashtag ─────────────────────────────────────────────
        builder.Entity<Hashtag>(e =>
        {
            // Tên hashtag là duy nhất
            e.HasIndex(h => h.Name).IsUnique();
        });

        // ── PostHashtag (N-N) ───────────────────────────────────
        builder.Entity<PostHashtag>(e =>
        {
            // Composite Primary Key
            e.HasKey(ph => new { ph.PostId, ph.HashtagId });

            e.HasOne(ph => ph.Post)
             .WithMany(p => p.PostHashtags)
             .HasForeignKey(ph => ph.PostId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(ph => ph.Hashtag)
             .WithMany(h => h.PostHashtags)
             .HasForeignKey(ph => ph.HashtagId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── UserHashtag (N-N) ───────────────────────────────────
        builder.Entity<UserHashtag>(e =>
        {
            // Composite Primary Key
            e.HasKey(uh => new { uh.UserId, uh.HashtagId });

            e.HasOne(uh => uh.User)
             .WithMany(u => u.FollowedHashtags)
             .HasForeignKey(uh => uh.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(uh => uh.Hashtag)
             .WithMany(h => h.UserHashtags)
             .HasForeignKey(uh => uh.HashtagId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── PostReport ──────────────────────────────────────────
        builder.Entity<PostReport>(e =>
        {
            // 1 user chỉ báo cáo 1 bài 1 lần
            e.HasIndex(r => new { r.PostId, r.ReporterId }).IsUnique();

            e.HasOne(r => r.Post)
             .WithMany(p => p.Reports)
             .HasForeignKey(r => r.PostId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(r => r.Reporter)
             .WithMany(u => u.PostReports)
             .HasForeignKey(r => r.ReporterId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Seed Roles ──────────────────────────────────────────
        // Tạo sẵn 2 roles theo yêu cầu B3
        builder.Entity<IdentityRole<Guid>>().HasData(
            new IdentityRole<Guid>
            {
                Id = new Guid("11111111-1111-1111-1111-111111111111"),
                Name = "User",
                NormalizedName = "USER",
                ConcurrencyStamp = "1"   // ← thêm dòng này
            },
            new IdentityRole<Guid>
            {
                Id = new Guid("22222222-2222-2222-2222-222222222222"),
                Name = "Admin",
                NormalizedName = "ADMIN",
                ConcurrencyStamp = "2"   // ← thêm dòng này
            }
        );
    }
}