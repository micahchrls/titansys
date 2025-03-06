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
            'product_name'=> $this->product->name,
            'product_price'=> $this->product->price,
            'product_size'=> $this->product->size,
            'product_category' => $this->product->productCategory->name,
            'product_brand' => $this->product->productBrand->name,
            'reorder_level' => $this->reorder_level,
            'last_restocked' => $this->last_restocked,
            'quantity' => $this->quantity,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
