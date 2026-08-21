using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using VoteService.Contracts;
using VoteService.Controllers;
using VoteService.Services;
using Xunit;

namespace VoteService.Tests
{
    public class VoteServiceTests
    {
        private readonly Mock<IVoteService> _mockVoteService;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly VotesController _controller;

        public VoteServiceTests()
        {
            // Thiết lập môi trường giả (Mock) cho Service và Configuration
            _mockVoteService = new Mock<IVoteService>();

            _mockConfig = new Mock<IConfiguration>();
            _mockConfig.Setup(c => c["REALTIME_SERVICE_URL"]).Returns("http://localhost:5003");

            _controller = new VotesController(_mockVoteService.Object, _mockConfig.Object);

            // Giả lập HttpContext để hàm GetOrCreateVoterToken() trong Controller không bị lỗi Cookie
            var httpContext = new DefaultHttpContext();
            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = httpContext
            };
        }

        [Fact]
        public async Task Vote_ValidRequest_ReturnsOkResult()
        {
            // Arrange (Chuẩn bị dữ liệu)
            var request = new VoteRequest { PollCode = "VALID_CODE", OptionIndex = 1 };
            var mockResult = new VoteResultDto(
                IsNewVote: true,
                Results: new PollResultsDto("VALID_CODE", "Test Question", new List<PollOptionDto>(), new List<int>(), 1, "Open")
            );

            _mockVoteService
                .Setup(s => s.VoteAsync(request.PollCode, request.OptionIndex, It.IsAny<string>()))
                .ReturnsAsync(mockResult);

            // Act (Thực thi)
            var actionResult = await _controller.Vote(request);

            // Assert (Kiểm tra kết quả)
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var returnedData = Assert.IsType<PollResultsDto>(okResult.Value);
            Assert.Equal("VALID_CODE", returnedData.Code);
        }

        [Fact]
        public async Task Vote_PollNotFound_ReturnsNotFound()
        {
            // Arrange
            var request = new VoteRequest { PollCode = "INVALID_CODE", OptionIndex = 1 };

            _mockVoteService
                .Setup(s => s.VoteAsync(request.PollCode, request.OptionIndex, It.IsAny<string>()))
                .ThrowsAsync(new KeyNotFoundException());

            // Act
            var actionResult = await _controller.Vote(request);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(actionResult.Result);
            Assert.NotNull(notFoundResult.Value);
        }

        [Fact]
        public async Task Vote_InvalidOptionIndex_ReturnsBadRequest()
        {
            // Arrange
            var request = new VoteRequest { PollCode = "VALID_CODE", OptionIndex = 99 }; // Index 99 không tồn tại

            _mockVoteService
                .Setup(s => s.VoteAsync(request.PollCode, request.OptionIndex, It.IsAny<string>()))
                .ThrowsAsync(new ArgumentOutOfRangeException());

            // Act
            var actionResult = await _controller.Vote(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
            Assert.NotNull(badRequestResult.Value);
        }
    }
}
