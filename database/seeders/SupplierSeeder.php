<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Supplier;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $suppliers = [
            ['name' => 'AutoParts Inc.', 'contact_name' => 'John Doe', 'email' => 'john@autoparts.com', 'phone' => '123-456-7890', 'address' => '123 Auto St, Carville, CV 12345'],
            ['name' => 'Car Electronics Ltd.', 'contact_name' => 'Jane Smith', 'email' => 'jane@carelectronics.com', 'phone' => '987-654-3210', 'address' => '456 Tech Ave, Gadgettown, GT 67890'],
            ['name' => 'Tire World', 'contact_name' => 'Mike Johnson', 'email' => 'mike@tireworld.com', 'phone' => '456-789-0123', 'address' => '789 Rubber Rd, Wheelcity, WC 34567'],
            ['name' => 'Engine Masters', 'contact_name' => 'Sarah Brown', 'email' => 'sarah@enginemasters.com', 'phone' => '789-012-3456', 'address' => '321 Power Ln, Motorville, MV 89012'],
            ['name' => 'Body Shop Supplies', 'contact_name' => 'Tom Wilson', 'email' => 'tom@bodyshopsupplies.com', 'phone' => '234-567-8901', 'address' => '654 Paint Blvd, Finishtown, FT 45678'],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::create($supplier);
        }
    }
}
