namespace Tweeter.Models.DTOs;

public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Handle { get; set; } = string.Empty;
    public bool Verified { get; set; }
}