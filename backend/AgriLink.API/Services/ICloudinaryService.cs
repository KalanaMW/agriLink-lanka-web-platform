namespace AgriLink.API.Services;

public interface ICloudinaryService
{
    Task<string> UploadImageAsync(IFormFile file, string folderName);
    Task<bool> DeleteImageAsync(string publicId);
}
