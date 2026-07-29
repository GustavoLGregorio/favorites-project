# Multi-Stage Dockerfile for Favorites Core API (.NET 10)
# Expected Build Context: Monorepo Root

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy project files for cached restore layer
COPY api/src/Favorites.Domain/*.csproj api/src/Favorites.Domain/
COPY api/src/Favorites.Application/*.csproj api/src/Favorites.Application/
COPY api/src/Favorites.Infrastructure/*.csproj api/src/Favorites.Infrastructure/
COPY api/src/Favorites.Api/*.csproj api/src/Favorites.Api/
COPY api/Favorites.sln api/

RUN dotnet restore api/Favorites.sln

# Copy API source code and publish
COPY api/ api/
RUN dotnet publish api/src/Favorites.Api/Favorites.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Production Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

EXPOSE 8080
EXPOSE 10000

ENV ASPNETCORE_HTTP_PORTS=8080
ENV ENABLE_SWAGGER=true

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Favorites.Api.dll"]
