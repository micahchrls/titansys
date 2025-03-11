<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Models\Product\Product;

class ProductImage extends Model
{
    /** @use HasFactory<\Database\Factories\Product\ProductImageFactory> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'file_name',
        'file_path',
        'file_extension',
        'file_size',
    ];

    /**
     * Upload a product image and create the record
     *
     * @param int $productId
     * @param UploadedFile $image
     * @param bool $isPrimary
     * @return self
     */
    public static function uploadImage(int $productId, UploadedFile $image, bool $isPrimary = false): self
    {
        // Generate a unique filename
        $originalName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $image->getClientOriginalExtension();
        $fileName = $originalName . '_' . time() . '.' . $extension;
        
        // Store the file in the products directory
        $path = $image->storeAs('products', $fileName, 'public');
        
        // If this is set as primary, reset other primary images for this product
        if ($isPrimary) {
            self::where('product_id', $productId);
        }
        
        // Create the image record
        return self::create([
            'product_id' => $productId,
            'file_name' => $fileName,
            'file_path' => $path,
            'file_extension' => $extension,
            'file_size' => $image->getSize(),
        ]);
    }

    /**
     * Get the full URL to the image
     *
     * @return string
     */
    public function getUrl(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }
    
    /**
     * Delete the image file from storage when the model is deleted
     */
    protected static function boot()
    {
        parent::boot();
        
        static::deleting(function (self $image) {
            if (Storage::disk('public')->exists($image->file_path)) {
                Storage::disk('public')->delete($image->file_path);
            }
        });
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
