# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj và restore
COPY ["backend/PollBuilder.API/PollBuilder.API-master/VoteService/VoteService.csproj", "backend/PollBuilder.API/PollBuilder.API-master/VoteService/"]
RUN dotnet restore "backend/PollBuilder.API/PollBuilder.API-master/VoteService/VoteService.csproj"

# Copy toàn bộ code
COPY . .

# Publish ứng dụng
WORKDIR "/src/backend/PollBuilder.API/PollBuilder.API-master/VoteService"
RUN dotnet publish "VoteService.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "VoteService.dll"]
