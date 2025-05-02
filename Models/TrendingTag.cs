using System.ComponentModel.DataAnnotations;

namespace Tweeter.Models;

public class TrendingTag
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Tag { get; set; } = string.Empty;
    
    public int Count { get; set; }
    
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}