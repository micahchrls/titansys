<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Product\Product;

class Inventory extends Model
{
    /** @use HasFactory<\Database\Factories\InventoryFactory> */
    use HasFactory;
    
    protected $fillable = [
        'product_id',
        'quantity',
        'reorder_level',
        'last_restocked',
    ];
    
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            $model->quantity = $model->quantity ?? 0;
        });
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

}
