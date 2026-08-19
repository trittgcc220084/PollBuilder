# Stage 1: Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy file csproj và restore
COPY ["backend/PollBuilder.API/PollBuilder.API-master/Gateway/Gateway.csproj", "backend/PollBuilder.API/PollBuilder.API-master/Gateway/"]
RUN dotnet restore "backend/PollBuilder.API/PollBuilder.API-master/Gateway/Gateway.csproj"

# Copy toàn bộ code và build
COPY . .
WORKDIR "/src/backend/PollBuilder.API/PollBuilder.API-master/Gateway"
RUN dotnet publish "Gateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS production
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Gateway.dll"]
