namespace Tweeter.Models;

public class PostRepost
{
    public int Id { get; set; }
    
    public int PostId { get; set; }
    public virtual Post Post { get; set; } = null!;
    
    public int UserId { get; set; }
    public virtual User User { get; set; } = null!;
    
    public DateTime Created { get; set; } = DateTime.UtcNow;
}