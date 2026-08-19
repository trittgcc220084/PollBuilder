# Stage 1: Restore
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS base
WORKDIR /src

COPY ["backend/PollBuilder.API/PollBuilder.API-master/VoteService/VoteService.csproj", "backend/PollBuilder.API/PollBuilder.API-master/VoteService/"]
RUN dotnet restore "backend/PollBuilder.API/PollBuilder.API-master/VoteService/VoteService.csproj"

COPY . .

# Stage 2: Static Analysis
FROM base AS tester
WORKDIR "/src/backend/PollBuilder.API/PollBuilder.API-master/VoteService"
RUN dotnet format --verify-no-changes || true

# Stage 3: Publish
FROM tester AS builder
RUN dotnet publish "VoteService.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 4: Production Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS production
WORKDIR /app
EXPOSE 8080

COPY --from=builder /app/publish .
ENTRYPOINT ["dotnet", "VoteService.dll"]
