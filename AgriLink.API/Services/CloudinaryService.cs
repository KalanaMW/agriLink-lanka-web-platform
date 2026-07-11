using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AgriLink.API.Services;

public class CloudinaryService : ICloudinaryService
{
    private readonly ILogger<CloudinaryService> _logger;
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(ILogger<CloudinaryService> logger, IConfiguration configuration)
    {
        _logger = logger;
        
        var cloudName = configuration["Cloudinary:CloudName"];
        var apiKey = configuration["Cloudinary:ApiKey"];
        var apiSecret = configuration["Cloudinary:ApiSecret"];

        if (string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
        {
            _logger.LogWarning("Cloudinary settings are missing in appsettings.json. Image uploads may fail.");
        }

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
        _cloudinary.Api.Secure = true;
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
            using var stream = file.OpenReadStream();
            
            var isImage = file.ContentType.ToLower().StartsWith("image/");
            
            if (isImage)
            {
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = folderName
                };
                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                if (uploadResult.Error != null)
                {
                    _logger.LogError("Cloudinary image upload error: {Error}", uploadResult.Error.Message);
                    throw new Exception($"Cloudinary upload failed: {uploadResult.Error.Message}");
                }
                return uploadResult.SecureUrl.ToString();
            }
            else
            {
                var uploadParams = new RawUploadParams()
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = folderName
                };
                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                if (uploadResult.Error != null)
                {
                    _logger.LogError("Cloudinary document upload error: {Error}", uploadResult.Error.Message);
                    throw new Exception($"Cloudinary upload failed: {uploadResult.Error.Message}");
                }
                return uploadResult.SecureUrl.ToString();
            }

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to Cloudinary");
            throw new Exception("Failed to upload file. Please try again.", ex);
        }
    }

    public async Task<bool> DeleteImageAsync(string fileUrl)
    {
        if (string.IsNullOrEmpty(fileUrl))
        {
            return false;
        }

        try
        {
            // Extract public ID from URL
            // Example URL: https://res.cloudinary.com/dgyqfax25/image/upload/v1234567890/folder/filename.jpg
            var uri = new Uri(fileUrl);
            var segments = uri.Segments;
            
            // Find the 'upload' segment index
            int uploadIndex = -1;
            for (int i = 0; i < segments.Length; i++)
            {
                if (segments[i].Trim('/') == "upload")
                {
                    uploadIndex = i;
                    break;
                }
            }

            if (uploadIndex != -1 && uploadIndex + 2 < segments.Length)
            {
                // The public ID includes the folder and the filename without extension
                // Skip the version segment (uploadIndex + 1)
                var publicIdWithExtension = string.Join("", segments.Skip(uploadIndex + 2)).Trim('/');
                var publicId = Path.ChangeExtension(publicIdWithExtension, null); // Remove extension

                var deletionParams = new DeletionParams(publicId);
                var deletionResult = await _cloudinary.DestroyAsync(deletionParams);

                if (deletionResult.Result == "ok")
                {
                    _logger.LogInformation("File deleted successfully from Cloudinary: {PublicId}", publicId);
                    return true;
                }
            }
            
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from Cloudinary");
            return false;
        }
    }
}
