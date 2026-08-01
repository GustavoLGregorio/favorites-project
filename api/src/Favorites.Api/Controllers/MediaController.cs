using Favorites.Application.Media.Queries.SearchMedia;
using Favorites.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using DomainServiceProvider = Favorites.Domain.Aggregates.UserAggregate.ServiceProvider;

namespace Favorites.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MediaController : ControllerBase
{
    private readonly ISender _sender;

    public MediaController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("search")]
    public async Task<ActionResult<IReadOnlyList<MediaSearchResult>>> Search(
        [FromQuery] string query,
        [FromQuery] string? type = null,
        [FromQuery] List<DomainServiceProvider>? providers = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Ok(Array.Empty<MediaSearchResult>());
        }

        var command = new SearchMediaQuery(query, type, providers, page, pageSize);
        var results = await _sender.Send(command, cancellationToken);
        return Ok(results);
    }
}
