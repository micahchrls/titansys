<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryResource extends JsonResource
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
            'product_id' => $this->product_id,
            'product_sku'=> $this->product->sku,
            'part_number'=> $this->product->part_number,
            'vehicle'=> $this->product->vehicle,
            'product_description'=> $this->product->description,
            'code'=> $this->product->code,
            'product_size'=> $this->product->size,
            'product_category_id' => $this->product->productCategory->id,
            'product_category' => $this->product->productCategory->name,
            'product_brand_id' => $this->product->productBrand->id,
            'product_brand' => $this->product->productBrand->name,
            'supplier_id' => $this->product->supplier->id,
            'supplier_name' => $this->product->supplier->name,
            'store_id' => $this->store->id,
            'store_name' => $this->store->name,
            'reorder_level' => $this->reorder_level,
            'last_restocked' => $this->last_restocked,
            'quantity' => $this->quantity,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'product_image' => $this->product->images->first(),
            'image_url' => $this->product->images->first() 
                ? url('storage/' . $this->product->images->first()->file_path)
                : null,
        ];
    }
}
