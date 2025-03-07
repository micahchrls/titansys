<?php

namespace App\Models\Stock;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockTransaction extends Model
{
    /** @use HasFactory<\Database\Factories\StockTransactionFactory> */
    use HasFactory;

    protected $fillable = [
        'store_id',
        'user_id',
        'transaction_type',
        'transaction_date',
        'transaction_amount',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'transaction_type' => 'string',
        'transaction_date' => 'datetime',
        'transaction_amount' => 'decimal:2',
    ];
}
