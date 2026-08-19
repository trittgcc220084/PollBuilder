using RealtimeService.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Tắt EventLog để tránh lỗi crash khi dừng service
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddControllers();
builder.Services.AddSignalR();

// Cấu hình CORS tương thích hoàn toàn với SignalR và Gateway (Port 5005)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("AllowFrontend");

app.MapControllers();
app.MapHub<PollHub>("/hubs/polls");

// Ép cứng RealtimeService chạy ở Port 5003
app.Run("http://localhost:5003");