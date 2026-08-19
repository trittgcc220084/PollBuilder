# Stage 1: Môi trường SDK để khôi phục thư viện (Restore)
FROM ://microsoft.com AS base
WORKDIR /src
COPY ["RealtimeService/RealtimeService.csproj", "RealtimeService/"]
RUN dotnet restore "RealtimeService/RealtimeService.csproj"
COPY . .
# Stage 2: [MỤC NÂNG ĐIỂM] Chạy Phân tích tĩnh (Static Analysis)
FROM base AS tester
# Lệnh quét lỗi định dạng code dựa trên file .editorconfig, nếu sai quy chuẩn sẽ dừng build
RUN dotnet format --verify-no-changes
# Stage 3: Biên dịch ứng dụng bản phát hành (Publish)
FROM tester AS builder
WORKDIR "/src/RealtimeService"
RUN dotnet publish "RealtimeService.csproj" -c Release -o /app/publish 
/p:UseAppHost=false
# Stage 4: Tạo Image Production siêu nhẹ (Runtime)
FROM ://microsoft.com AS production
WORKDIR /app
EXPOSE 8080
# Chỉ lấy sản phẩm cuối, loại bỏ hoàn toàn bộ SDK nặng nề giúp giảm kích thước image tối đa
COPY --from=builder /app/publish .
ENTRYPOINT ["dotnet", "RealtimeService.dll"]