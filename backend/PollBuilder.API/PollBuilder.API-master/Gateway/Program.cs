using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

// 1. Tắt EventLog của Windows để tránh lỗi crash khi dừng ứng dụng
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// 2. Load cấu hình ocelot.json
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

// 3. Cấu hình CORS linh hoạt cho cả Web và SignalR
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

builder.Services.AddOcelot(builder.Configuration);

var app = builder.Build();

// 4. Đặt UseCors TRƯỚC UseWebSockets và UseOcelot
app.UseCors("AllowFrontend");

app.UseWebSockets();

await app.UseOcelot();

// 5. Ép Gateway luôn lắng nghe đúng Port 5005
app.Run("http://localhost:5005");