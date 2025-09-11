using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tweeter.Data;

namespace Tweeter.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly TweeterContext _context;

    public UsersController(TweeterContext context)
    {
        _context = context;
    }

    [HttpGet("current")]
    public async Task<ActionResult<object>> GetCurrentUser()
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Handle == "demo");

        if (user == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            user.Id,
            user.Name,
            user.Handle,
            user.Verified
        });
    }

    [HttpGet("suggestions")]
    public async Task<ActionResult<IEnumerable<object>>> GetUserSuggestions()
    {
        var users = await _context.Users
            .Where(u => u.Handle != "demo")
            .OrderBy(u => u.Name)
            .Take(10)
            .ToListAsync();

        var result = users.Select(u => new
        {
            u.Id,
            u.Name,
            u.Handle,
            u.Verified,
            Followed = false
        });

        return Ok(result);
    }
}