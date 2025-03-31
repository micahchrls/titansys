<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'product' => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'sku' => $this->product->sku,
                'product_brand_id' => $this->product->product_brand_id,
                'product_category_id' => $this->product->product_category_id,
                'product_brand_name' => $this->product->productBrand->name ?? null,
                'product_category_name' => $this->product->productCategory->name ?? null,
            ],
        ];
    }
}
