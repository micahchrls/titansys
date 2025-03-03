<?php

namespace Database\Factories\Product;

use App\Models\Product\Brand;
use App\Models\Product\Category;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sku' => strtoupper(Str::random(8)),
            'name' => fake()->words(3, true),
            'description' => fake()->paragraph(),
            'brand_id' => Brand::factory(),
            'category_id' => Category::factory(),
            'supplier_id' => Supplier::factory(),
            'price' => fake()->randomFloat(2, 10, 1000),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function forBrand(Brand $brand): static
    {
        return $this->state(fn (array $attributes) => [
            'brand_id' => $brand->brand_id,
        ]);
    }

    public function forCategory(Category $category): static
    {
        return $this->state(fn (array $attributes) => [
            'category_id' => $category->category_id,
        ]);
    }

    public function forSupplier(Supplier $supplier): static
    {
        return $this->state(fn (array $attributes) => [
            'supplier_id' => $supplier->supplier_id,
        ]);
    }
}
