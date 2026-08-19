using RealtimeService.Hubs;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// 1. Tắt EventLog để tránh lỗi crash khi dừng service
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// 2. Đăng ký Services
builder.Services.AddControllers();
builder.Services.AddSignalR();

// 3. Cấu hình CORS tương thích hoàn toàn với SignalR và Gateway
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        _ = policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 4. Lấy PORT linh hoạt từ Render (Mặc định 5003 khi chạy local)
var port = Environment.GetEnvironmentVariable("PORT") ?? "5003";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

WebApplication app = builder.Build();

app.UseCors("AllowFrontend");

// 5. Endpoint Health Check cho Render
app.MapGet("/", () => Results.Ok("RealtimeService SignalR API is running!"));

app.MapControllers();
app.MapHub<PollHub>("/hubs/polls");

app.Run();
