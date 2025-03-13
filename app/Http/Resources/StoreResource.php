<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreResource extends JsonResource
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
            'name' => $this->name,
            'location_address' => $this->location_address,
            'contact_number' => $this->contact_number,
            'email' => $this->email,
            'store_image' => $this->storeImage,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
