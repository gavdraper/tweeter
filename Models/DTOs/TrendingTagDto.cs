namespace Tweeter.Models.DTOs;

public class TrendingTagDto
{
    public int Id { get; set; }
    public string Tag { get; set; } = string.Empty;
    public int Count { get; set; }
    public DateTime LastUpdated { get; set; }
}