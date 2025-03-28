<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleProductResource extends JsonResource
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
            'sku' => $this->sku,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'size' => $this->size,
            'brand_id' => $this->product_brand_id,
            'brand_name' => $this->productBrand->name,
            'quantity' => $this->inventory->quantity,   
            'store_id' => $this->inventory->store_id,
            'store_name' => $this->inventory->store->name,
            'category_id' => $this->product_category_id,
            'category_name' => $this->productCategory->name,
            'image' => $this->productImage
        ];
    }
}
