<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Brand extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'brand_id';

    protected $fillable = [
        'brand_name',
        'description'
    ];

    public function products()
    {
        return $this->hasMany(Product::class, 'brand_id');
    }
}