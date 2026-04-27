using Microsoft.AspNetCore.Mvc;

namespace InteractHub.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly long _maxFileSize = 10 * 1024 * 1024; // 10MB
    private readonly string[] _allowedImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

    public UploadController(IWebHostEnvironment env)
    {
        _env = env;
    }

    // POST /api/upload/image
    [HttpPost("image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Không có file được chọn" });

        if (file.Length > _maxFileSize)
            return BadRequest(new { message = "File quá lớn (max 10MB)" });

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedImageExtensions.Contains(extension))
            return BadRequest(new { message = "Định dạng file không được hỗ trợ" });

        try
        {
            var fileName = $"{Guid.NewGuid()}{extension}";
            var uploadPath = Path.Combine(_env.WebRootPath, "uploads", "images");
            
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/images/{fileName}";
            
            return Ok(new
            {
                url = fileUrl,
                fileName = fileName,
                size = file.Length
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi upload file", error = ex.Message });
        }
    }
}