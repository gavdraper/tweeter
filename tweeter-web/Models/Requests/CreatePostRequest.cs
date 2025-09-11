namespace Tweeter.Models.Requests;

public class CreatePostRequest
{
    public string Text { get; set; } = string.Empty;
    public int UserId { get; set; }
    public int? ParentId { get; set; }
}