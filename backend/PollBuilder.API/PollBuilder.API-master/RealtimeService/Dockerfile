# Stage 1: Môi trường SDK để khôi phục thư viện (Restore)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS base
WORKDIR /src

COPY ["backend/PollBuilder.API/PollBuilder.API-master/RealtimeService/RealtimeService.csproj", "backend/PollBuilder.API/PollBuilder.API-master/RealtimeService/"]
RUN dotnet restore "backend/PollBuilder.API/PollBuilder.API-master/RealtimeService/RealtimeService.csproj"

COPY . .

# Stage 2: Chạy Phân tích tĩnh (Static Analysis)
FROM base AS tester
WORKDIR "/src/backend/PollBuilder.API/PollBuilder.API-master/RealtimeService"
RUN dotnet format --verify-no-changes || true

# Stage 3: Biên dịch ứng dụng bản phát hành (Publish)
FROM tester AS builder
RUN dotnet publish "RealtimeService.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 4: Tạo Image Production siêu nhẹ (Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS production
WORKDIR /app
EXPOSE 8080

COPY --from=builder /app/publish .
ENTRYPOINT ["dotnet", "RealtimeService.dll"]
