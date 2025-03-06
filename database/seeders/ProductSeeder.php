<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product\Product;
use App\Models\Product\ProductBrand;
use App\Models\Product\ProductCategory;
use App\Models\Supplier;
use Carbon\Carbon;
use Faker\Factory as Faker;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        // Get existing IDs for relationship fields
        $brandIds = ProductBrand::pluck('id')->toArray();
        $categoryIds = ProductCategory::whereNotNull('parent_id')->pluck('id')->toArray(); // Use subcategories
        $supplierIds = Supplier::pluck('id')->toArray();
        
        // Sample auto parts products with different categories
        $products = [
            // Engine Parts
            [
                'sku' => 'EP-' . $faker->unique()->numerify('######'),
                'name' => 'High Performance Piston Set',
                'description' => 'Premium forged pistons for increased durability and performance',
                'price' => $faker->randomFloat(2, 120, 500),
                'size' => '86mm Standard Bore',
            ],
            [
                'sku' => 'EP-' . $faker->unique()->numerify('######'),
                'name' => 'OEM Cylinder Head Assembly',
                'description' => 'Factory replacement cylinder head with valves and springs installed',
                'price' => $faker->randomFloat(2, 350, 1200),
                'size' => 'Standard OEM Size',
            ],
            
            // Transmission
            [
                'sku' => 'TR-' . $faker->unique()->numerify('######'),
                'name' => 'Automatic Transmission Rebuild Kit',
                'description' => 'Complete kit for rebuilding automatic transmissions including gaskets, seals, and clutch plates',
                'price' => $faker->randomFloat(2, 180, 450),
                'size' => 'Universal',
            ],
            [
                'sku' => 'TR-' . $faker->unique()->numerify('######'),
                'name' => 'Heavy Duty Clutch Kit',
                'description' => 'Performance clutch kit with pressure plate and throw-out bearing',
                'price' => $faker->randomFloat(2, 150, 400),
                'size' => '240mm',
            ],
            
            // Brakes
            [
                'sku' => 'BR-' . $faker->unique()->numerify('######'),
                'name' => 'Ceramic Brake Pad Set',
                'description' => 'Low dust ceramic brake pads for quiet stopping power',
                'price' => $faker->randomFloat(2, 40, 120),
                'size' => 'Front Axle Fitment',
            ],
            [
                'sku' => 'BR-' . $faker->unique()->numerify('######'),
                'name' => 'Drilled & Slotted Rotors',
                'description' => 'Performance rotors for improved cooling and braking efficiency',
                'price' => $faker->randomFloat(2, 80, 200),
                'size' => '12.5 inch diameter',
            ],
            
            // Electrical & Lighting
            [
                'sku' => 'EL-' . $faker->unique()->numerify('######'),
                'name' => 'High Output Alternator',
                'description' => '200 Amp alternator for vehicles with high electrical demands',
                'price' => $faker->randomFloat(2, 130, 320),
                'size' => 'Standard Mounting',
            ],
            [
                'sku' => 'EL-' . $faker->unique()->numerify('######'),
                'name' => 'LED Headlight Conversion Kit',
                'description' => 'Bright white LED headlights with plug and play installation',
                'price' => $faker->randomFloat(2, 60, 180),
                'size' => 'H11/9005/9006 Compatible',
            ],
            
            // Wheels & Tires
            [
                'sku' => 'WT-' . $faker->unique()->numerify('######'),
                'name' => 'Alloy Wheel Set',
                'description' => 'Lightweight aluminum alloy wheels with machined finish',
                'price' => $faker->randomFloat(2, 450, 1200),
                'size' => '18x8.5 5x114.3',
            ],
            [
                'sku' => 'WT-' . $faker->unique()->numerify('######'),
                'name' => 'All-Season Performance Tires',
                'description' => 'All-weather traction with 50,000 mile warranty',
                'price' => $faker->randomFloat(2, 120, 250),
                'size' => '235/45R18',
            ],
            
            // Oils & Fluids
            [
                'sku' => 'OF-' . $faker->unique()->numerify('######'),
                'name' => 'Synthetic Engine Oil',
                'description' => 'Full synthetic motor oil for maximum engine protection',
                'price' => $faker->randomFloat(2, 25, 60),
                'size' => '5 Quart',
            ],
            [
                'sku' => 'OF-' . $faker->unique()->numerify('######'),
                'name' => 'Transmission Fluid',
                'description' => 'Automatic transmission fluid for smooth shifting',
                'price' => $faker->randomFloat(2, 15, 45),
                'size' => '1 Gallon',
            ],
            
            // More products
            [
                'sku' => 'EX-' . $faker->unique()->numerify('######'),
                'name' => 'Catalytic Converter',
                'description' => 'Direct-fit catalytic converter, CARB compliant',
                'price' => $faker->randomFloat(2, 150, 350),
                'size' => 'Universal',
            ],
            [
                'sku' => 'AC-' . $faker->unique()->numerify('######'),
                'name' => 'Air Conditioning Compressor',
                'description' => 'New A/C compressor with clutch assembly',
                'price' => $faker->randomFloat(2, 180, 400),
                'size' => 'OEM Replacement',
            ],
            [
                'sku' => 'FI-' . $faker->unique()->numerify('######'),
                'name' => 'Air Filter',
                'description' => 'High-flow air filter for improved engine breathing',
                'price' => $faker->randomFloat(2, 15, 40),
                'size' => 'Standard Rectangular',
            ]
        ];
        
        // Create products with random brands, categories, and suppliers
        foreach ($products as $productData) {
            $product = new Product($productData);
            $product->product_brand_id = $faker->randomElement($brandIds);
            $product->product_category_id = $faker->randomElement($categoryIds);
            $product->supplier_id = $faker->randomElement($supplierIds);
            $product->save();
        }
        
        // Add some additional random products
        for ($i = 0; $i < 15; $i++) {
            Product::create([
                'sku' => strtoupper($faker->bothify('??-######')),
                'name' => $faker->words($faker->numberBetween(2, 5), true),
                'description' => $faker->paragraph(2),
                'price' => $faker->randomFloat(2, 10, 1000),
                'size' => $faker->optional(0.7)->randomElement(['Small', 'Medium', 'Large', 'Standard', 'Universal']),
                'product_brand_id' => $faker->randomElement($brandIds),
                'product_category_id' => $faker->randomElement($categoryIds),
                'supplier_id' => $faker->randomElement($supplierIds),
            ]);
        }
    }
}
