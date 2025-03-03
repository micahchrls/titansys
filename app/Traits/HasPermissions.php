<?php

namespace App\Traits;

trait HasPermissions
{
    public function hasPermissionTo(string $permission): bool
    {
        // For now, we'll use a simple role-based check
        // This can be expanded later to include more granular permissions
        return match ($this->role) {
            'admin' => true,  // Admins have all permissions
            'user' => $this->hasUserPermission($permission),
            default => false,
        };
    }

    private function hasUserPermission(string $permission): bool
    {
        // Define which permissions regular users have
        $userPermissions = [
            'view_products',
            'view_inventory',
            'view_sales',
        ];

        return in_array($permission, $userPermissions);
    }

    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermissionTo($permission)) {
                return true;
            }
        }
        return false;
    }

    public function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->hasPermissionTo($permission)) {
                return false;
            }
        }
        return true;
    }
}