using Microsoft.AspNetCore.Mvc;

namespace tweeter.Controllers;

public class HomeController : Controller
{
    public IActionResult Index()
    {
        // Return the static SPA shell (index.html) from wwwroot
        return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "index.html"), "text/html");
    }
}
