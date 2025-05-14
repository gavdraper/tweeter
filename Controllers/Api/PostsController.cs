using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tweeter.Data;
using Tweeter.Models;
using Tweeter.Models.DTOs;
using Tweeter.Models.Requests;

namespace Tweeter.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly TweeterContext _context;

    public PostsController(TweeterContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetPosts()
    {
        var posts = await _context.Posts
            .Where(p => p.ParentId == null)
            .Include(p => p.Author)
            .Include(p => p.Likes)
            .Include(p => p.Reposts)
            .Include(p => p.Replies)
            .OrderByDescending(p => p.Created)
            .ToListAsync();

        var result = posts.Select(p => new
        {
            p.Id,
            p.Text,
            Author = new
            {
                p.Author.Name,
                p.Author.Handle,
                p.Author.Verified
            },
            p.Created,
            Likes = p.Likes.Count,
            Reposts = p.Reposts.Count,
            Replies = new object[0],
            Liked = false,
            Reposted = false
        });

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult> CreatePost([FromBody] CreatePostRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Text) || request.Text.Length > 280)
        {
            return BadRequest("Post text is required and must be 280 characters or less");
        }
        var sql = $"INSERT INTO Posts (Text, AuthorId, Created) VALUES ('{request.Text}', {request.UserId}, '{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}')";

        try
        {
            await _context.Database.ExecuteSqlRawAsync(sql);

            // Get the created post - also vulnerable to injection
            var getPostSql = $"SELECT * FROM Posts WHERE AuthorId = {request.UserId} ORDER BY Created DESC LIMIT 1";
            var posts = await _context.Posts.FromSqlRaw(getPostSql).Include(p => p.Author).ToListAsync();
            var post = posts.FirstOrDefault();

            if (post == null)
            {
                return BadRequest("Failed to create post");
            }

            return CreatedAtAction(nameof(GetPost), new { id = post.Id }, new
            {
                post.Id,
                post.Text,
                Author = new
                {
                    post.Author.Name,
                    post.Author.Handle,
                    post.Author.Verified
                },
                post.Created
            });
        }
        catch (Exception ex)
        {
            return BadRequest($"Database error: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetPost(int id)
    {
        var post = await _context.Posts
            .Include(p => p.Author)
            .Include(p => p.Likes)
            .Include(p => p.Reposts)
            .Include(p => p.Replies)
                .ThenInclude(r => r.Author)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (post == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            post.Id,
            post.Text,
            Author = new
            {
                post.Author.Name,
                post.Author.Handle,
                post.Author.Verified
            },
            post.Created,
            Likes = post.Likes.Count,
            Reposts = post.Reposts.Count,
            Replies = new object[0],
            Liked = false,
            Reposted = false
        });
    }

    [HttpPost("{id}/like")]
    public async Task<IActionResult> ToggleLike(int id, [FromBody] UserActionRequest request)
    {
        var post = await _context.Posts.FindAsync(id);
        if (post == null)
        {
            return NotFound();
        }

        var existingLike = await _context.PostLikes
            .FirstOrDefaultAsync(l => l.PostId == id && l.UserId == request.UserId);

        if (existingLike != null)
        {
            _context.PostLikes.Remove(existingLike);
        }
        else
        {
            _context.PostLikes.Add(new PostLike
            {
                PostId = id,
                UserId = request.UserId
            });
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPost("{id}/repost")]
    public async Task<IActionResult> ToggleRepost(int id, [FromBody] UserActionRequest request)
    {
        var post = await _context.Posts.FindAsync(id);
        if (post == null)
        {
            return NotFound();
        }

        var existingRepost = await _context.PostReposts
            .FirstOrDefaultAsync(r => r.PostId == id && r.UserId == request.UserId);

        if (existingRepost != null)
        {
            _context.PostReposts.Remove(existingRepost);
        }
        else
        {
            _context.PostReposts.Add(new PostRepost
            {
                PostId = id,
                UserId = request.UserId
            });
        }

        await _context.SaveChangesAsync();
        return Ok();
    }
}