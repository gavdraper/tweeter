using Microsoft.EntityFrameworkCore;
using Tweeter.Models;

namespace Tweeter.Data;

public class TweeterContext : DbContext
{
    public TweeterContext(DbContextOptions<TweeterContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<PostLike> PostLikes { get; set; }
    public DbSet<PostRepost> PostReposts { get; set; }
    public DbSet<TrendingTag> TrendingTags { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Handle).IsUnique();
        });

        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasOne(d => d.Author)
                .WithMany(p => p.Posts)
                .HasForeignKey(d => d.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Parent)
                .WithMany(p => p.Replies)
                .HasForeignKey(d => d.ParentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PostLike>(entity =>
        {
            entity.HasOne(d => d.Post)
                .WithMany(p => p.Likes)
                .HasForeignKey(d => d.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.User)
                .WithMany(p => p.Likes)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.PostId, e.UserId }).IsUnique();
        });

        modelBuilder.Entity<PostRepost>(entity =>
        {
            entity.HasOne(d => d.Post)
                .WithMany(p => p.Reposts)
                .HasForeignKey(d => d.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.User)
                .WithMany(p => p.Reposts)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.PostId, e.UserId }).IsUnique();
        });

        modelBuilder.Entity<TrendingTag>(entity =>
        {
            entity.HasIndex(e => e.Tag).IsUnique();
        });
    }
}