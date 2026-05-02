using InteractHub.Data;
using InteractHub.DTOs.Auth;
using InteractHub.DTOs.Friend;
using InteractHub.DTOs.User;
using InteractHub.Model;
using InteractHub.Service;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace InteractHub.Tests;

// ── Helper tạo InMemory DB ───────────────────────────────────────────────────
public static class TestDbHelper
{
    public static AppDbContext CreateDb(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        var db = new AppDbContext(options);

        // Seed roles
        if (!db.Roles.Any())
        {
            db.Roles.AddRange(
                new IdentityRole<Guid>
                {
                    Id = Guid.NewGuid(),
                    Name = "User",
                    NormalizedName = "USER"
                },
                new IdentityRole<Guid>
                {
                    Id = Guid.NewGuid(),
                    Name = "Admin",
                    NormalizedName = "ADMIN"
                }
            );
            db.SaveChanges();
        }

        return db;
    }
}

// ── Helper tạo UserManager mock ──────────────────────────────────────────────
public static class UserManagerHelper
{
    public static UserManager<ApplicationUser> Create(AppDbContext db)
    {
        var store = new UserStore<ApplicationUser, IdentityRole<Guid>, AppDbContext, Guid>(db);
        var hasher = new PasswordHasher<ApplicationUser>();
        var validators = new List<IUserValidator<ApplicationUser>> { new UserValidator<ApplicationUser>() };
        var pwValidators = new List<IPasswordValidator<ApplicationUser>> { new PasswordValidator<ApplicationUser>() };

        var logger = NullLogger<UserManager<ApplicationUser>>.Instance;

        return new UserManager<ApplicationUser>(
            store,
            null!,
            hasher,
            validators,
            pwValidators,
            new UpperInvariantLookupNormalizer(),
            new IdentityErrorDescriber(),
            null!,
            logger
        );
    }
}

// ── Helper tạo IConfiguration mock ──────────────────────────────────────────
public static class ConfigHelper
{
    public static IConfiguration Create() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = "SuperSecretKeyForTestingOnly1234567890!!",
                ["Jwt:Issuer"] = "InteractHub",
                ["Jwt:Audience"] = "InteractHubUsers",
                ["Jwt:ExpiryMinutes"] = "60"
            })
            .Build();
}

// ════════════════════════════════════════════════════════════════════════════
// AUTH TESTS (5 test)
// ════════════════════════════════════════════════════════════════════════════
public class AuthServiceTests
{
    // Test 1: Đăng ký thành công → trả về token
    [Fact]
    public async Task Register_ValidRequest_ReturnsToken()
    {
        var db = TestDbHelper.CreateDb("auth_test_1");
        var userManager = UserManagerHelper.Create(db);
        var config = ConfigHelper.Create();
        var service = new AuthService(userManager, config);

        var result = await service.RegisterAsync(new RegisterDto
        {
            UserName = "testuser",
            Email = "test@test.com",
            Password = "Test@123",
            DisplayName = "Test User"
        });

        Assert.NotNull(result);
        Assert.NotEmpty(result.Token);
        Assert.Equal("test@test.com", result.Email);
    }

    // Test 2: Đăng ký email trùng → throw exception
    [Fact]
    public async Task Register_DuplicateEmail_ThrowsException()
    {
        var db = TestDbHelper.CreateDb("auth_test_2");
        var userManager = UserManagerHelper.Create(db);
        var config = ConfigHelper.Create();
        var service = new AuthService(userManager, config);

        await service.RegisterAsync(new RegisterDto
        {
            UserName = "user1",
            Email = "dup@test.com",
            Password = "Test@123",
            DisplayName = "User 1"
        });

        await Assert.ThrowsAsync<Exception>(() =>
            service.RegisterAsync(new RegisterDto
            {
                UserName = "user2",
                Email = "dup@test.com",
                Password = "Test@123",
                DisplayName = "User 2"
            }));
    }

    // Test 3: Đăng nhập đúng → trả về token
    [Fact]
    public async Task Login_ValidCredentials_ReturnsToken()
    {
        var db = TestDbHelper.CreateDb("auth_test_3");
        var userManager = UserManagerHelper.Create(db);
        var config = ConfigHelper.Create();
        var service = new AuthService(userManager, config);

        await service.RegisterAsync(new RegisterDto
        {
            UserName = "loginuser",
            Email = "login@test.com",
            Password = "Test@123",
            DisplayName = "Login User"
        });

        var result = await service.LoginAsync(new LoginDto
        {
            Email = "login@test.com",
            Password = "Test@123"
        });

        Assert.NotNull(result);
        Assert.NotEmpty(result.Token);
    }

    // Test 4: Đăng nhập sai mật khẩu → throw exception
    [Fact]
    public async Task Login_WrongPassword_ThrowsException()
    {
        var db = TestDbHelper.CreateDb("auth_test_4");
        var userManager = UserManagerHelper.Create(db);
        var config = ConfigHelper.Create();
        var service = new AuthService(userManager, config);

        await service.RegisterAsync(new RegisterDto
        {
            UserName = "user3",
            Email = "wrong@test.com",
            Password = "Test@123",
            DisplayName = "User 3"
        });

        await Assert.ThrowsAsync<Exception>(() =>
            service.LoginAsync(new LoginDto
            {
                Email = "wrong@test.com",
                Password = "SaiMatKhau123"
            }));
    }

    // Test 5: Đăng nhập email không tồn tại → throw exception
    [Fact]
    public async Task Login_EmailNotFound_ThrowsException()
    {
        var db = TestDbHelper.CreateDb("auth_test_5");
        var userManager = UserManagerHelper.Create(db);
        var config = ConfigHelper.Create();
        var service = new AuthService(userManager, config);

        await Assert.ThrowsAsync<Exception>(() =>
            service.LoginAsync(new LoginDto
            {
                Email = "notexist@test.com",
                Password = "Test@123"
            }));
    }
}

// ════════════════════════════════════════════════════════════════════════════
// FRIEND TESTS (6 test)
// ════════════════════════════════════════════════════════════════════════════
public class FriendServiceTests
{
    private (AppDbContext db, FriendService service, ApplicationUser userA, ApplicationUser userB)
        Setup(string dbName)
    {
        var db = TestDbHelper.CreateDb(dbName);
        var service = new FriendService(db);

        var userA = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = "usera",
            Email = "a@test.com",
            DisplayName = "User A",
            IsActive = true
        };
        var userB = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = "userb",
            Email = "b@test.com",
            DisplayName = "User B",
            IsActive = true
        };
        db.Users.AddRange(userA, userB);
        db.SaveChanges();

        return (db, service, userA, userB);
    }

    // Test 6: Gửi lời mời kết bạn thành công
    [Fact]
    public async Task SendFriendRequest_Valid_CreatesPendingFriendship()
    {
        var (db, service, userA, userB) = Setup("friend_test_1");

        await service.SendFriendRequestAsync(userA.Id, userB.Id);

        var friendship = db.Friendships.FirstOrDefault();
        Assert.NotNull(friendship);
        Assert.Equal("Pending", friendship.Status);
        Assert.Equal(userA.Id, friendship.RequesterId);
        Assert.Equal(userB.Id, friendship.AddresseeId);
    }

    // Test 7: Gửi lời mời trùng → throw exception
    [Fact]
    public async Task SendFriendRequest_Duplicate_ThrowsException()
    {
        var (db, service, userA, userB) = Setup("friend_test_2");

        await service.SendFriendRequestAsync(userA.Id, userB.Id);

        await Assert.ThrowsAsync<Exception>(() =>
            service.SendFriendRequestAsync(userA.Id, userB.Id));
    }

    // Test 8: Chấp nhận lời mời → status = Accepted
    [Fact]
    public async Task AcceptFriendRequest_Valid_StatusBecomesAccepted()
    {
        var (db, service, userA, userB) = Setup("friend_test_3");

        await service.SendFriendRequestAsync(userA.Id, userB.Id);
        var friendship = db.Friendships.First();

        await service.AcceptFriendRequestAsync(userB.Id, friendship.Id);

        var updated = db.Friendships.First();
        Assert.Equal("Accepted", updated.Status);
    }

    // Test 9: Lấy danh sách bạn bè → đúng số lượng
    [Fact]
    public async Task GetFriends_ReturnsAcceptedFriendsOnly()
    {
        var (db, service, userA, userB) = Setup("friend_test_4");

        await service.SendFriendRequestAsync(userA.Id, userB.Id);
        var friendship = db.Friendships.First();
        await service.AcceptFriendRequestAsync(userB.Id, friendship.Id);

        var friends = await service.GetFriendsAsync(userA.Id);

        Assert.Single(friends);
        Assert.Equal(userB.Id, friends[0].UserId);
    }

    // Test 10: Từ chối lời mời → xóa friendship
    [Fact]
    public async Task RejectFriendRequest_Valid_RemovesFriendship()
    {
        var (db, service, userA, userB) = Setup("friend_test_5");

        await service.SendFriendRequestAsync(userA.Id, userB.Id);
        var friendship = db.Friendships.First();

        await service.RejectFriendRequestAsync(userB.Id, friendship.Id);

        Assert.Empty(db.Friendships);
    }

    // Test 11: Hủy kết bạn → xóa friendship
    [Fact]
    public async Task Unfriend_Valid_RemovesFriendship()
    {
        var (db, service, userA, userB) = Setup("friend_test_6");

        await service.SendFriendRequestAsync(userA.Id, userB.Id);
        var friendship = db.Friendships.First();
        await service.AcceptFriendRequestAsync(userB.Id, friendship.Id);

        await service.UnfriendAsync(userA.Id, userB.Id);

        Assert.Empty(db.Friendships);
    }
}

// ════════════════════════════════════════════════════════════════════════════
// USER TESTS (4 test)
// ════════════════════════════════════════════════════════════════════════════
public class UserServiceTests
{
    private (AppDbContext db, UserService service, ApplicationUser user) Setup(string dbName)
    {
        var db = TestDbHelper.CreateDb(dbName);
        var service = new UserService(db);

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = "testuser",
            Email = "test@test.com",
            DisplayName = "Test User",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        db.Users.Add(user);
        db.SaveChanges();

        return (db, service, user);
    }

    // Test 12: Lấy profile hợp lệ → trả về đúng thông tin
    [Fact]
    public async Task GetProfile_ValidUser_ReturnsProfile()
    {
        var (db, service, user) = Setup("user_test_1");

        var result = await service.GetProfileAsync(user.Id);

        Assert.NotNull(result);
        Assert.Equal(user.Id, result.Id);
        Assert.Equal("Test User", result.DisplayName);
        Assert.Equal(0, result.PostsCount);
        Assert.Equal(0, result.FriendsCount);
    }

    // Test 13: Lấy profile không tồn tại → throw exception
    [Fact]
    public async Task GetProfile_UserNotFound_ThrowsException()
    {
        var (db, service, _) = Setup("user_test_2");

        await Assert.ThrowsAsync<Exception>(() =>
            service.GetProfileAsync(Guid.NewGuid()));
    }

    // Test 14: Cập nhật profile → lưu đúng thông tin
    [Fact]
    public async Task UpdateProfile_ValidData_UpdatesCorrectly()
    {
        var (db, service, user) = Setup("user_test_3");

        await service.UpdateProfileAsync(user.Id, new UpdateProfileDto
        {
            DisplayName = "New Name",
            Bio = "New Bio",
            School = "SGU"
        });

        var updated = db.Users.First();
        Assert.Equal("New Name", updated.DisplayName);
        Assert.Equal("New Bio", updated.Bio);
        Assert.Equal("SGU", updated.School);
    }

    // Test 15: Cập nhật profile user không tồn tại → throw exception
    [Fact]
    public async Task UpdateProfile_UserNotFound_ThrowsException()
    {
        var (db, service, _) = Setup("user_test_4");

        await Assert.ThrowsAsync<Exception>(() =>
            service.UpdateProfileAsync(Guid.NewGuid(), new UpdateProfileDto
            {
                DisplayName = "New Name"
            }));
    }
}