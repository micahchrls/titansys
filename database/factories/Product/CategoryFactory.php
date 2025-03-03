<?php

namespace Database\Factories\Product;

use App\Models\Product\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);
        return [
            'category_name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->paragraph(),
            'parent_category_id' => null,
            'is_active' => true,
        ];
    }

    public function asChild(Category $parent = null): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_category_id' => $parent ? $parent->category_id : Category::factory(),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}