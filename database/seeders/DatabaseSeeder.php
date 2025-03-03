<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Store\Store;
use App\Models\Product\Category;
use App\Models\Product\Brand;
use App\Models\Product\Product;
use App\Models\Supplier;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create main store
        $mainStore = Store::create([
            'name' => 'Main Branch',
            'location' => '123 Main Street, City Center',
            'phone' => '+1234567890',
            'email' => 'main@example.com',
            'description' => 'Our flagship store location',
            'is_active' => true
        ]);

        // Create admin user
        User::create([
            'store_id' => $mainStore->store_id,
            'username' => 'admin',
            'name' => 'System Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Create demo brands
        $brands = [
            ['brand_name' => 'TechPro', 'description' => 'Leading technology manufacturer'],
            ['brand_name' => 'FashionStyle', 'description' => 'Premium fashion brand'],
            ['brand_name' => 'HomeLux', 'description' => 'Luxury home furnishings'],
        ];

        foreach ($brands as $brand) {
            Brand::create([
                ...$brand,
                'slug' => \Str::slug($brand['brand_name']),
                'is_active' => true
            ]);
        }

        // Create main categories
        $mainCategories = [
            ['category_name' => 'Electronics', 'description' => 'Electronic devices and accessories'],
            ['category_name' => 'Clothing', 'description' => 'Apparel and fashion items'],
            ['category_name' => 'Home & Living', 'description' => 'Home decor and household items'],
        ];

        foreach ($mainCategories as $category) {
            $cat = Category::create([
                ...$category,
                'slug' => \Str::slug($category['category_name']),
                'is_active' => true
            ]);

            // Create subcategories for each main category
            for ($i = 1; $i <= 3; $i++) {
                Category::create([
                    'category_name' => "{$category['category_name']} Subcategory {$i}",
                    'slug' => \Str::slug("{$category['category_name']} Subcategory {$i}"),
                    'description' => "Subcategory {$i} for {$category['category_name']}",
                    'parent_category_id' => $cat->category_id,
                    'is_active' => true
                ]);
            }
        }

        // Create suppliers
        $suppliers = [
            [
                'name' => 'Global Supply Co',
                'contact_person' => 'John Doe',
                'phone' => '+1234567890',
                'email' => 'contact@globalsupply.example.com',
                'address' => '456 Supply Street, Industry Zone',
                'description' => 'Global supplier of electronic components',
                'is_active' => true
            ],
            [
                'name' => 'Fashion Wholesale Ltd',
                'contact_person' => 'Jane Smith',
                'phone' => '+1234567891',
                'email' => 'sales@fashionwholesale.example.com',
                'address' => '789 Fashion Avenue, Design District',
                'description' => 'Premium fashion items supplier',
                'is_active' => true
            ]
        ];

        foreach ($suppliers as $supplier) {
            Supplier::create($supplier);
        }

        // Create sample products for each category
        Category::all()->each(function ($category) {
            Product::factory()
                ->count(5)
                ->forCategory($category)
                ->create();
        });

        // Create additional test users
        User::factory()
            ->count(5)
            ->state(function (array $attributes) use ($mainStore) {
                return ['store_id' => $mainStore->store_id];
            })
            ->create();
    }
}
