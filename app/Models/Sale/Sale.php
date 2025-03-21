<?php

namespace App\Models\Sale;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;
use App\Models\Store\Store;
use App\Models\Sale\SaleItem;
use App\Models\Sale\SaleLog;

class Sale extends Model
{
    /** @use HasFactory<\Database\Factories\Sale\SaleFactory> */
    use HasFactory;

    protected $fillable = [
        'store_id',
        'user_id',
        'total_price',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function log(): HasMany
    {
        return $this->hasMany(SaleLog::class);
    }


}
