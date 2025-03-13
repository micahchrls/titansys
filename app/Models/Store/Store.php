<?php

namespace App\Models\Store;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Store extends Model
{
    /** @use HasFactory<\Database\Factories\Store\StoreFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'location_address',
        'contact_number',
        'email',
    ];

    public function storeImage(): HasOne
    {
        return $this->hasOne(StoreImage::class);
    }
}
