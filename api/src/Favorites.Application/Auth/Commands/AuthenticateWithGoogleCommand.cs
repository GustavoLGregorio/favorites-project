using Favorites.Application.Auth.DTOs;
using MediatR;

namespace Favorites.Application.Auth.Commands;

public record AuthenticateWithGoogleCommand(string IdToken) : IRequest<AuthResponseDto>;
