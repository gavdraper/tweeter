# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## SDLC
Always commit to feature branches. Use Github CLI when asked to create pull requests.
Write clean, SOLID, Best Practice code.
Avoid duplication.
Never remove tests because they are failing.
If you get stuck, stop and ask for my input.

## Project Overview

This is a Twitter-like microblogging application called "Tweeter" built with:
- **Backend**: ASP.NET Core 9.0 web application serving as a SPA shell
- **Frontend**: Vanilla JavaScript Single Page Application (SPA)
- **Architecture**: The C# backend serves static files and the main index.html, while all interactivity is handled client-side

## Common Commands

### Build and Run
```bash
# Build the project
dotnet build

# Run in development mode (launches browser automatically)
dotnet run

# Run with specific profile
dotnet run --launch-profile http   # HTTP on port 5281
dotnet run --launch-profile https  # HTTPS on port 7126
```

### Development
```bash
# Restore packages
dotnet restore

# Clean build artifacts
dotnet clean
```

## Application Architecture

### Backend Structure
- `Program.cs`: Main application entry point, configures MVC and static file serving
- `Controllers/HomeController.cs`: Single controller that serves the SPA shell (index.html)
- `Properties/launchSettings.json`: Development server configuration (HTTP/HTTPS ports)
- Uses minimal ASP.NET Core setup focused on serving static content

### Frontend Structure (wwwroot/)
- `index.html`: Main SPA shell with complete UI structure
- `js/app.js`: Single JavaScript file containing all client-side logic
- `css/styles.css`: Complete styling with dark theme, responsive design
- **State Management**: Simple in-memory JavaScript objects
- **Architecture Pattern**: Vanilla JS with custom element creation helpers

### Key Frontend Components
- **Feed System**: Timeline with posts, likes, reposts, replies
- **Composer**: Inline and modal post composition with character counting
- **Navigation**: Single-page navigation between views (Home, Explore, etc.)
- **Responsive Design**: Mobile-first with collapsing sidebars

### Data Flow
- All data stored in client-side `state` object
- No backend API - purely static frontend
- Local state includes: feed posts, trending topics, user suggestions
- Uses `localStorage` for persistence (none currently implemented)

## Development Notes

### Frontend Development
- Pure vanilla JavaScript - no build process or bundling
- Custom DOM manipulation helpers in `app.js:18-32`
- All styling uses CSS custom properties for theming
- Responsive breakpoints: 1300px, 1000px, 640px

### Adding Features
- Extend the `state` object for new data
- Add rendering functions following the existing `render*()` pattern
- Use the `el()` helper function for DOM creation
- Follow the existing event listener patterns