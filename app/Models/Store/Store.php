<?php

namespace App\Models\Store;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Store extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'store_id';

    protected $fillable = [
        'name',
        'location',
        'phone',
        'email'
        
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'store_id');
    }
}
