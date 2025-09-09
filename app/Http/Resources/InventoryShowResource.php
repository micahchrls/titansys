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
            'product_sku' => $this->product->sku,
            'part_number' => $this->product->part_number,
            'vehicle' => $this->product->vehicle,
            'product_description' => $this->product->description,
            'code' => $this->product->code,
            'product_size' => $this->product->size,
            'product_category_id' => $this->product->productCategory->id,
            'product_category' => $this->product->productCategory->name,
            'product_brand_id' => $this->product->productBrand->id,
            'product_brand' => $this->product->productBrand->name,
            'product_image' => $this->product->productImage,
            'reorder_level' => $this->reorder_level,
            'last_restocked' => $this->last_restocked,
            'quantity' => $this->quantity,
            'supplier_id' => $this->product->supplier->id,
            'supplier' => $this->product->supplier,
            'supplier_name' => $this->product->supplier->name,
            'store_id' => $this->store->id,
            'store_name' => $this->store->name,
            'store' => $this->store,
            'stock_movement' => $this->stockMovements->map(function ($stockMovement) {
                return [
                    'id' => $stockMovement->id,
                    'quantity' => $stockMovement->quantity,
                    'movement_type' => $stockMovement->movement_type,
                    'created_at' => $stockMovement->created_at,
                    'updated_at' => $stockMovement->updated_at,
                ];
            })->sortByDesc('created_at')->values()->all(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
