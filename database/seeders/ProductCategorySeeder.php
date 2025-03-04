<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product\ProductCategory;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Engine Parts' => ['Pistons', 'Cylinder Heads', 'Timing Belts'],
            'Transmission' => ['Gearbox', 'Clutch', 'Torque Converter'],
            'Suspension & Steering' => ['Shock Absorbers', 'Struts', 'Control Arms'],
            'Brakes' => ['Brake Pads', 'Rotors', 'Calipers'],
            'Electrical & Lighting' => ['Batteries', 'Alternators', 'Headlights'],
            'Body & Exterior' => ['Bumpers', 'Fenders', 'Grilles'],
            'Interior' => ['Seats', 'Dashboard', 'Floor Mats'],
            'Wheels & Tires' => ['Alloy Wheels', 'Steel Wheels', 'All-Season Tires'],
            'Exhaust System' => ['Mufflers', 'Catalytic Converters', 'Exhaust Pipes'],
            'Cooling System' => ['Radiators', 'Water Pumps', 'Thermostats'],
            'Fuel System' => ['Fuel Pumps', 'Injectors', 'Carburetors'],
            'Filters' => ['Air Filters', 'Oil Filters', 'Fuel Filters'],
            'Belts & Hoses' => ['Serpentine Belts', 'Radiator Hoses', 'Power Steering Hoses'],
            'Oils & Fluids' => ['Engine Oil', 'Transmission Fluid', 'Brake Fluid'],
            'Tools & Equipment' => ['Socket Sets', 'Jack Stands', 'Diagnostic Tools']
        ];

        foreach ($categories as $category => $subcategories) {
            $parentCategory = ProductCategory::create(['name' => $category]);
            foreach ($subcategories as $subcategory) {
                ProductCategory::create([
                    'name' => $subcategory,
                    'parent_id' => $parentCategory->id
                ]);
            }
        }
    }
}
