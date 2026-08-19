using Microsoft.EntityFrameworkCore;
using PollService.Data;
using PollService.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Bật Console Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// 2. Đăng ký Controllers và Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 3. Lấy chuỗi kết nối và kiểm tra an toàn
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("LỖI: Chưa khai báo 'DefaultConnection' trong file appsettings.json hoặc biến môi trường!");
}

// 4. Cấu hình DbContext kết nối PostgreSQL (Neon DB)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// 5. Đăng ký Dependency Injection cho IPollService
builder.Services.AddScoped<IPollService, PollService.Services.PollService>();

// 6. Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 7. Lấy PORT linh hoạt từ Render (Mặc định 5001 khi chạy local)
var port = Environment.GetEnvironmentVariable("PORT") ?? "5001";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var app = builder.Build();

// 8. Bật Swagger Middleware
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "PollService API v1");
});

// 9. Tự động kiểm tra và tạo bảng trên Neon DB khi khởi chạy
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// 10. Endpoint Health Check cho Render / Trang chủ
app.MapGet("/", () => Results.Ok("PollService API is running!"));

// 11. Middleware pipeline
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();
