using Microsoft.EntityFrameworkCore;
using Tweeter.Data;

var builder = WebApplication.CreateBuilder(args);

// Add EF Core with SQLite database (supports raw SQL for injection demo)
builder.Services.AddDbContext<TweeterContext>(options =>
    options.UseSqlite("Data Source=tweeter.db"));

// Add MVC services
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Initialize database and seed data
await InitializeDatabase(app.Services);

// Serve static assets (css, js)
app.UseStaticFiles();

// Map default controller route -> Home/Index
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();

static async Task InitializeDatabase(IServiceProvider services)
{
    using var scope = services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<TweeterContext>();

    await context.Database.EnsureCreatedAsync();

    if (!context.Users.Any())
    {
        await SeedData(context);
    }
}

static async Task SeedData(TweeterContext context)
{
    // Create users
    var demoUser = new Tweeter.Models.User
    {
        Name = "Demo User",
        Handle = "demo",
        Verified = true
    };

    var ada = new Tweeter.Models.User
    {
        Name = "Ada Lovelace",
        Handle = "ada",
        Verified = false
    };

    var linus = new Tweeter.Models.User
    {
        Name = "Linus Torvalds",
        Handle = "linus",
        Verified = false
    };

    var grace = new Tweeter.Models.User
    {
        Name = "Grace Hopper",
        Handle = "grace",
        Verified = false
    };

    context.Users.AddRange(demoUser, ada, linus, grace);
    await context.SaveChangesAsync();

    // Create trending tags
    var trends = new[]
    {
        new Tweeter.Models.TrendingTag { Tag = "#DotNet9", Count = 1234 },
        new Tweeter.Models.TrendingTag { Tag = "#AI", Count = 987 },
        new Tweeter.Models.TrendingTag { Tag = "#CSharp", Count = 654 },
        new Tweeter.Models.TrendingTag { Tag = "#TweeterClone", Count = 420 }
    };

    context.TrendingTags.AddRange(trends);
    await context.SaveChangesAsync();

    // Create initial posts
    var welcomePost = new Tweeter.Models.Post
    {
        Text = "Welcome to Tweeter – a totally original microblogging platform.",
        AuthorId = demoUser.Id,
        Created = DateTime.UtcNow.AddMinutes(-30)
    };

    var aiPost = new Tweeter.Models.Post
    {
        Text = "Just finished debugging a recursive algorithm. The computer was stuck in an infinite loop, but at least it was consistent! #CSharp #AI",
        AuthorId = ada.Id,
        Created = DateTime.UtcNow.AddMinutes(-15)
    };

    var kernelPost = new Tweeter.Models.Post
    {
        Text = "Talk is cheap. Show me the code. #Linux #Programming",
        AuthorId = linus.Id,
        Created = DateTime.UtcNow.AddMinutes(-10)
    };

    context.Posts.AddRange(welcomePost, aiPost, kernelPost);
    await context.SaveChangesAsync();
}
