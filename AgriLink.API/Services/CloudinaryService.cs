namespace AgriLink.API.Services;

public class CloudinaryService : ICloudinaryService
{
    private readonly ILogger<CloudinaryService> _logger;
    private readonly IWebHostEnvironment _environment;
    private readonly string _uploadFolder;

    public CloudinaryService(ILogger<CloudinaryService> logger, IWebHostEnvironment environment)
    {
        _logger = logger;
        _environment = environment;
        
        // Create uploads folder in wwwroot
        _uploadFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads");
        
        if (!Directory.Exists(_uploadFolder))
        {
            Directory.CreateDirectory(_uploadFolder);
            _logger.LogInformation("Created uploads directory at: {Path}", _uploadFolder);
        }
    }

    public async Task<string> UploadImageAsync(IFormFile file, string folderName)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is empty or null");
        }

        // Validate file type
        var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
        {
            throw new ArgumentException("Invalid file type. Only JPEG, PNG, WebP images and PDF documents are allowed.");
        }

        // Validate file size (max 5MB)
        if (file.Length > 5 * 1024 * 1024)
        {
            throw new ArgumentException("File size exceeds 5MB limit.");
        }

        try
        {
            // Create folder if it doesn't exist
            var folderPath = Path.Combine(_uploadFolder, folderName);
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            // Generate unique filename
            var fileExtension = Path.GetExtension(file.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(folderPath, uniqueFileName);

            // Save file to disk
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return relative URL path
            var relativeUrl = $"/uploads/{folderName}/{uniqueFileName}";
            _logger.LogInformation("File uploaded successfully to: {Path}", relativeUrl);
            
            return relativeUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file locally");
            throw new Exception("Failed to upload file. Please try again.", ex);
        }
    }

    public Task<bool> DeleteImageAsync(string filePath)
    {
        if (string.IsNullOrEmpty(filePath))
        {
            return Task.FromResult(false);
        }

        try
        {
            // Convert relative URL to absolute file path
            var fileName = filePath.Replace("/uploads/", "").Replace("/", Path.DirectorySeparatorChar.ToString());
            var absolutePath = Path.Combine(_uploadFolder, fileName);

            if (File.Exists(absolutePath))
            {
                File.Delete(absolutePath);
                _logger.LogInformation("File deleted successfully: {Path}", absolutePath);
                return Task.FromResult(true);
            }
            
            return Task.FromResult(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file");
            return Task.FromResult(false);
        }
    }
}
