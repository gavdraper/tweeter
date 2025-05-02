namespace Tweeter.Models.DTOs;

public class PostDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime Created { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string AuthorHandle { get; set; } = string.Empty;
    public bool AuthorVerified { get; set; }
    public int Likes { get; set; }
    public int Reposts { get; set; }
    public int Replies { get; set; }
}