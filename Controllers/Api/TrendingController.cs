using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tweeter.Data;
using Tweeter.Models.DTOs;

namespace Tweeter.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class TrendingController : ControllerBase
{
    private readonly TweeterContext _context;

    public TrendingController(TweeterContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetTrendingTags()
    {
        var tags = await _context.TrendingTags
            .OrderByDescending(t => t.Count)
            .ToListAsync();
        
        var result = tags.Select(t => new
        {
            t.Tag,
            t.Count
        });

        return Ok(result);
    }
}