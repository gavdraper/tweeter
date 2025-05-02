using System.ComponentModel.DataAnnotations;

namespace Tweeter.Models;

public class Post
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(280)]
    public string Text { get; set; } = string.Empty;
    
    public int AuthorId { get; set; }
    public virtual User Author { get; set; } = null!;
    
    public DateTime Created { get; set; } = DateTime.UtcNow;
    
    public int? ParentId { get; set; }
    public virtual Post? Parent { get; set; }
    
    public virtual ICollection<Post> Replies { get; set; } = new List<Post>();
    public virtual ICollection<PostLike> Likes { get; set; } = new List<PostLike>();
    public virtual ICollection<PostRepost> Reposts { get; set; } = new List<PostRepost>();
    
    public int LikeCount => Likes.Count;
    public int RepostCount => Reposts.Count;
    public int ReplyCount => Replies.Count;
}