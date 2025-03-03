<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
