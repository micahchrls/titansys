<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Product\Product;
use App\Models\Stock\StockMovement;
use App\Models\Stock\StockLog;
use App\Models\Store\Store;

class Inventory extends Model
{
    /** @use HasFactory<\Database\Factories\InventoryFactory> */
    use HasFactory;
    
    protected $fillable = [
        'product_id',
        'store_id',
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

    public function stockMovements(): HasMany {
        return $this->hasMany(StockMovement::class);
    }

    public function stockLogs(): HasMany {
        return $this->hasMany(StockLog::class);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}
