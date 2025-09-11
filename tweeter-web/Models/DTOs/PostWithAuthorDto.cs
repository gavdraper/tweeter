namespace Tweeter.Models.DTOs;

public class PostWithAuthorDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int AuthorId { get; set; }
    public int? ParentId { get; set; }
    public DateTime Created { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string AuthorHandle { get; set; } = string.Empty;
    public bool AuthorVerified { get; set; }
}