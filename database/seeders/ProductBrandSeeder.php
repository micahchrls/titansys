<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product\ProductBrand;

class ProductBrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $carBrands = [
            'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW',
            'Mercedes-Benz', 'Audi', 'Volkswagen', 'Nissan', 'Hyundai',
            'Kia', 'Mazda', 'Subaru', 'Lexus', 'Volvo'
        ];

        foreach ($carBrands as $brand) {
            ProductBrand::create(['name' => $brand]);
        }
    }
}
