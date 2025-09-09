<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'part_number' => $this->part_number,
            'vehicle' => $this->vehicle,
            'description' => $this->description,
            'code' => $this->code,
            'size' => $this->size,
            'product_brand_id' => $this->productBrand->id,
            'product_brand_name'=> $this->productBrand->name,
            'product_category_id' => $this->productCategory->id,
            'product_category_name'=> $this->productCategory->name,
            'supplier_id' => $this->supplier->id,
            'supplier_name'=> $this->supplier->name,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
