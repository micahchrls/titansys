<?php

namespace App\Models\Sale;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use App\Models\Store\Store;

class Sale extends Model
{
    /** @use HasFactory<\Database\Factories\Sale\SaleFactory> */
    use HasFactory;

    protected $fillable = [
        'store_id',
        'user_id',
        'total_price',
        'discount',
        'tax',
        'net_total',
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


}
