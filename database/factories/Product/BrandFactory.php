<?php

namespace Database\Factories\Product;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BrandFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->company();
        return [
            'brand_name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->paragraph(),
            'website' => fake()->url(),
            'logo_url' => fake()->imageUrl(640, 480, 'business'),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}