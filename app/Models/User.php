<?php

namespace App\Models;

use App\Traits\HasPermissions;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Store\Store;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasPermissions;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'store_id',
        'username',
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Define relationship with Store model
    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    // Check if user has a specific role
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    // Check if user is an admin
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }
}
