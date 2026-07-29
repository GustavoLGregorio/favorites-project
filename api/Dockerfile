# Multi-Stage Dockerfile for Favorites Core API (.NET 10)
# Expected Build Context: api/

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy project files for cached restore layer
COPY src/Favorites.Domain/*.csproj src/Favorites.Domain/
COPY src/Favorites.Application/*.csproj src/Favorites.Application/
COPY src/Favorites.Infrastructure/*.csproj src/Favorites.Infrastructure/
COPY src/Favorites.Api/*.csproj src/Favorites.Api/
COPY Favorites.sln .

RUN dotnet restore Favorites.sln

# Copy source code and publish
COPY . .
RUN dotnet publish src/Favorites.Api/Favorites.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Production Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

EXPOSE 8080
EXPOSE 10000

ENV ASPNETCORE_HTTP_PORTS=8080
ENV ENABLE_SWAGGER=true

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Favorites.Api.dll"]
