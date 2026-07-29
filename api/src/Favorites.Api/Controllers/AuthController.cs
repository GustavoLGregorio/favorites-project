using System.Security.Claims;
using Favorites.Application.Auth.Commands;
using Favorites.Application.Auth.DTOs;
using Favorites.Domain.Repositories;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Favorites.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ISender _mediator;
    private readonly IUserRepository _userRepository;

    public AuthController(ISender mediator, IUserRepository userRepository)
    {
        _mediator = mediator;
        _userRepository = userRepository;
    }

    [HttpPost("google")]
    public async Task<ActionResult<AuthResponseDto>> AuthenticateWithGoogle([FromBody] GoogleAuthRequestDto dto, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(dto.IdToken))
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid payload",
                Detail = "IdToken must be provided."
            });
        }

        var command = new AuthenticateWithGoogleCommand(dto.IdToken);
        var response = await _mediator.Send(command, cancellationToken);
        return Ok(response);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> GetCurrentUser(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        var userDto = new UserProfileDto(
            user.Id,
            user.GoogleId,
            user.Email,
            user.Name,
            user.AvatarUrl,
            user.CreatedAtUtc);

        return Ok(userDto);
    }
}
