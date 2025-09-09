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
                'part_number' => 'High Performance Piston Set',
                'vehicle' => 'Universal Application',
                'description' => 'Premium forged pistons for increased durability and performance',
                'code' => strtoupper($faker->bothify('??###??')),
                'size' => '86mm Standard Bore',
            ],
            [
                'sku' => 'EP-' . $faker->unique()->numerify('######'),
                'part_number' => 'OEM Cylinder Head Assembly',
                'vehicle' => 'Honda Civic 2016-2021',
                'description' => 'Factory replacement cylinder head with valves and springs installed',
                'code' => strtoupper($faker->bothify('??###??')),
                'size' => 'Standard OEM Size',
            ],
            
            // Transmission
            [
                'sku' => 'TR-' . $faker->unique()->numerify('######'),
                'part_number' => 'Automatic Transmission Rebuild Kit',
                'vehicle' => 'Toyota Camry 2015-2020',
                'description' => 'Complete kit for rebuilding automatic transmissions including gaskets, seals, and clutch plates',
                'code' => strtoupper($faker->bothify('??###??')),
                'size' => 'Universal',
            ],
            [
                'sku' => 'TR-' . $faker->unique()->numerify('######'),
                'part_number' => 'Heavy Duty Clutch Kit',
                'vehicle' => 'Ford F-150 2011-2018',
                'description' => 'Performance clutch kit with pressure plate and throw-out bearing',
                'code' => strtoupper($faker->bothify('??###??')),
                'size' => '240mm',
            ],
            
            // Brakes
            [
                'sku' => 'BR-' . $faker->unique()->numerify('######'),
                'part_number' => 'Ceramic Brake Pad Set',
                'vehicle' => 'Subaru WRX 2015-2021',
                'description' => 'Low dust ceramic brake pads for quiet stopping power',
                'code' => strtoupper($faker->bothify('??###??')),
                'size' => 'Front Axle Fitment',
            ],
            [
                'sku' => 'BR-' . $faker->unique()->numerify('######'),
                'part_number' => 'Drilled & Slotted Rotors',
                'vehicle' => 'Universal Application',
                'description' => 'Performance rotors for improved cooling and braking efficiency',
                'code' => strtoupper($faker->bothify('??###??')),
                'size' => '12.5 inch diameter',
            ],
            
            // Electrical & Lighting
            [
                'sku' => 'EL-' . $faker->unique()->numerify('######'),
                'part_number' => 'High Output Alternator',
                'vehicle' => 'Honda Civic 2016-2021',
                'description' => '200 Amp alternator for vehicles with high electrical demands',
                'code' => strtoupper($faker->bothify('??###??')),
                'size' => 'Standard Mounting',
            ],
            [
                'sku' => 'EL-' . $faker->unique()->numerify('######'),
                'part_number' => 'LED Headlight Conversion Kit',
                'vehicle' => 'Toyota Camry 2015-2020',
                'description' => 'Bright white LED headlights with plug and play installation',
                'code' => strtoupper($faker->bothify('??###??')),
                'size' => 'H11/9005/9006 Compatible',
            ],
            
            // Wheels & Tires
            [
                'sku' => 'WT-' . $faker->unique()->numerify('######'),
                'part_number' => 'Alloy Wheel Set',
                'vehicle' => 'Ford F-150 2011-2018',
                'description' => 'Lightweight aluminum alloy wheels with machined finish',
                'code' => strtoupper($faker->bothify('??###??')),
                'size' => '18x8.5 5x114.3',
            ],
            [
                'sku' => 'WT-' . $faker->unique()->numerify('######'),
                'part_number' => 'All-Season Performance Tires',
                'vehicle' => 'Subaru WRX 2015-2021',
                'description' => 'All-weather traction with 50,000 mile warranty',
                'code' => strtoupper($faker->bothify('??###??')),
                'size' => '235/45R18',
            ],
            
            // Oils & Fluids
            [
                'sku' => 'OF-' . $faker->unique()->numerify('######'),
                'part_number' => 'Synthetic Engine Oil',
                'vehicle' => 'Universal Application',
                'description' => 'Full synthetic motor oil for maximum engine protection',
                'code' => strtoupper($faker->bothify('??###??')),
                'size' => '5 Quart',
            ],
            [
                'sku' => 'OF-' . $faker->unique()->numerify('######'),
                'part_number' => 'Transmission Fluid',
                'vehicle' => 'Honda Civic 2016-2021',
                'description' => 'Automatic transmission fluid for smooth shifting',
                'code' => strtoupper($faker->bothify('??###??')),
                'size' => '1 Gallon',
            ],
            
            // More products
            [
                'sku' => 'EX-' . $faker->unique()->numerify('######'),
                'part_number' => 'Catalytic Converter',
                'vehicle' => 'Toyota Camry 2015-2020',
                'description' => 'Direct-fit catalytic converter, CARB compliant',
                'code' => strtoupper($faker->bothify('??###??')),
                'size' => 'Universal',
            ],
            [
                'sku' => 'AC-' . $faker->unique()->numerify('######'),
                'part_number' => 'Air Conditioning Compressor',
                'vehicle' => 'Ford F-150 2011-2018',
                'description' => 'New A/C compressor with clutch assembly',
                'code' => strtoupper($faker->bothify('??###??')),
                'size' => 'OEM Replacement',
            ],
            [
                'sku' => 'FI-' . $faker->unique()->numerify('######'),
                'part_number' => 'Air Filter',
                'vehicle' => 'Subaru WRX 2015-2021',
                'description' => 'High-flow air filter for improved engine breathing',
                'code' => strtoupper($faker->bothify('??###??')),
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
            $code = strtoupper($faker->bothify('??###??'));
            
            Product::create([
                'sku' => strtoupper($faker->bothify('??-######')),
                'part_number' => $faker->words($faker->numberBetween(2, 5), true),
                'vehicle' => $faker->optional(0.7)->randomElement(['Universal Application', 'Honda Civic 2016-2021', 'Toyota Camry 2015-2020', 'Ford F-150 2011-2018', 'Subaru WRX 2015-2021']),
                'description' => $faker->paragraph(2),
                'code' => $code,
                'size' => $faker->optional(0.7)->randomElement(['Small', 'Medium', 'Large', 'Standard', 'Universal']),
                'product_brand_id' => $faker->randomElement($brandIds),
                'product_category_id' => $faker->randomElement($categoryIds),
                'supplier_id' => $faker->randomElement($supplierIds),
            ]);
        }
    }
}
