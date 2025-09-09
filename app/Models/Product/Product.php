<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Product\ProductBrand;
use App\Models\Product\ProductCategory;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Product\ProductImage;
use App\Models\Inventory;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\Product\ProductFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sku',
        'part_number',
        'vehicle',
        'description',
        'code',
        'size',
        'product_brand_id',
        'product_category_id',
        'supplier_id',
    ];

    public function inventory(): HasOne
    {
        return $this->hasOne(Inventory::class);
    }

    public function productBrand(): BelongsTo
    {
        return $this->belongsTo(ProductBrand::class);
    }

    public function productCategory(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
    
    public function productImage(): HasOne
    {
        return $this->hasOne(ProductImage::class);
    }
    
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }
}
