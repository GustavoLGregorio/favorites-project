using Favorites.Application.Auth.DTOs;
using Favorites.Application.Common.Interfaces;
using Favorites.Domain.Aggregates.UserAggregate;
using Favorites.Domain.Repositories;
using MediatR;

namespace Favorites.Application.Auth.Commands;

public class AuthenticateWithGoogleCommandHandler : IRequestHandler<AuthenticateWithGoogleCommand, AuthResponseDto>
{
    private readonly IGoogleAuthService _googleAuthService;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthenticateWithGoogleCommandHandler(
        IGoogleAuthService googleAuthService,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _googleAuthService = googleAuthService;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponseDto> Handle(AuthenticateWithGoogleCommand request, CancellationToken cancellationToken)
    {
        var googleUserInfo = await _googleAuthService.ValidateIdTokenAsync(request.IdToken, cancellationToken);
        if (googleUserInfo is null || !googleUserInfo.EmailVerified)
        {
            throw new UnauthorizedAccessException("Invalid or unverified Google token.");
        }

        var existingUser = await _userRepository.GetByGoogleIdAsync(googleUserInfo.GoogleId, cancellationToken);
        if (existingUser is null)
        {
            existingUser = User.CreateFromGoogle(
                googleUserInfo.GoogleId,
                googleUserInfo.Email,
                googleUserInfo.Name,
                googleUserInfo.AvatarUrl);

            await _userRepository.AddAsync(existingUser, cancellationToken);
        }
        else
        {
            existingUser.UpdateProfile(googleUserInfo.Name, googleUserInfo.AvatarUrl);
            await _userRepository.UpdateAsync(existingUser, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var (token, expiresAtUtc) = _jwtTokenGenerator.GenerateToken(existingUser);
        var userDto = new UserProfileDto(
            existingUser.Id,
            existingUser.GoogleId,
            existingUser.Email,
            existingUser.Name,
            existingUser.AvatarUrl,
            existingUser.CreatedAtUtc);

        return new AuthResponseDto(token, expiresAtUtc, userDto);
    }
}
