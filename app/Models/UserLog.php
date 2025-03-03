<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class UserLog extends Model
{
    /** @use HasFactory<\Database\Factories\UserLogFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action_type',
        'description',
        'ip_address',
    ];

     /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'action_type' => 'enum',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
