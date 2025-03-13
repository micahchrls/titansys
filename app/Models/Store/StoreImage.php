<?php

namespace App\Models\Store;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\UploadedFile;

class StoreImage extends Model
{
    /** @use HasFactory<\Database\Factories\Store\StoreImageFactory> */
    use HasFactory;

    protected $fillable = [
        'store_id',
        'file_name',
        'file_path',
        'file_extension',
        'file_size',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * Upload a product image and create the record
     *
     * @param int $storeId
     * @param UploadedFile $image
     * @param bool $isPrimary
     * @return self
     */
    public static function uploadImage(int $storeId, UploadedFile $image, bool $isPrimary = false): self
    {
        // Generate a unique filename
        $originalName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $image->getClientOriginalExtension();
        $fileName = $originalName . '_' . time() . '.' . $extension;

        // Store the file in the stores directory
        $path = $image->storeAs('stores', $fileName, 'public');

        // If this is set as primary, reset other primary images for this store
        if ($isPrimary) {
            self::where('store_id', $storeId)->delete();
        }

        // Create the image record
        return self::create([
            'store_id' => $storeId,
            'file_name' => $fileName,
            'file_path' => $path,
            'file_extension' => $extension,
            'file_size' => $image->getSize(),
        ]);
    }
}
