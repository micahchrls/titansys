<?php

namespace App\Models;

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
}
