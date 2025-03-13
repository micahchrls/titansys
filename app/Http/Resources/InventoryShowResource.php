<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryShowResource extends JsonResource
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
            'product_description'=> $this->product->description,
            'product_price'=> $this->product->price,
            'product_size'=> $this->product->size,
            'product_category_id'=> $this->product->productCategory->id,
            'product_category' => $this->product->productCategory->name,
            'product_brand_id'=> $this->product->productBrand->id,
            'product_brand' => $this->product->productBrand->name,
            'product_image' => $this->product->productImage,
            'reorder_level' => $this->reorder_level,
            'last_restocked' => $this->last_restocked,
            'quantity' => $this->quantity,
            'supplier' => $this->product->supplier,
            'stock_movement' => $this->stockMovement->map(function ($stockMovement) {
                return [
                    'id' => $stockMovement->id,
                    'quantity' => $stockMovement->quantity,
                    'movement_type' => $stockMovement->movement_type,
                    'created_at' => $stockMovement->created_at,
                    'updated_at' => $stockMovement->updated_at,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
