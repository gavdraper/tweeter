using System.ComponentModel.DataAnnotations;

namespace Tweeter.Models;

public class User
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string Handle { get; set; } = string.Empty;
    
    public bool Verified { get; set; }
    
    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
    public virtual ICollection<PostLike> Likes { get; set; } = new List<PostLike>();
    public virtual ICollection<PostRepost> Reposts { get; set; } = new List<PostRepost>();
}