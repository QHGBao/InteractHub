using InteractHub.Data;
using InteractHub.Hubs;
using InteractHub.Model;
using InteractHub.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ── Database ────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// ── Identity ────────────────────────────────────────────────────
builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
{
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// ── Đăng ký Services ────────────────────────────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IStoryService, StoryService>();
builder.Services.AddScoped<ISearchService, SearchService>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<ILikeService, LikeService>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<IStoryService,StoryService>();
builder.Services.AddScoped<IHashtagService, HashtagService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAdminService, AdminService>();

// SignalR
builder.Services.AddSignalR();

// ── JWT Authentication ──────────────────────────────────────────
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!)),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true
    };

    options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
});

// ── CORS — cho phép React gọi API ───────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IFriendService, FriendService>();
builder.Services.AddScoped<IUserService, UserService>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseStaticFiles();
// Thêm để upload ảnh
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads")),
    RequestPath = "/uploads"
});
app.UseCors("ReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
 
    foreach (var roleName in new[] { "User", "Admin" })
    {
        if (!await roleManager.RoleExistsAsync(roleName))
            await roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
    }
}
// XOÁ SAU KHI TEST
app.MapGet("/dev/seed-admin", async (UserManager<ApplicationUser> um, RoleManager<IdentityRole<Guid>> rm) =>
{
    var email = "admin@test.com";
    if (!await rm.RoleExistsAsync("Admin"))
        await rm.CreateAsync(new IdentityRole<Guid>("Admin"));

    var user = await um.FindByEmailAsync(email);
    if (user == null)
    {
        user = new ApplicationUser { UserName = email, Email = email, DisplayName = "Admin", Role = "Admin" };
        await um.CreateAsync(user, "Admin123!");
    }

    await um.AddToRoleAsync(user, "Admin");
    return Results.Ok(new { message = "Admin created", email, password = "Admin123!" });
});
app.Run();