<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Store\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\StoreResource;
use App\Models\Store\StoreImage;

class StoreController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Store::with('storeImage');

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $stores = $query->latest()->paginate(10);
            $stores = StoreResource::collection($stores)->response()->getData(true);

            return Inertia::render('stores', [
                'stores' => $stores,
                'filters' => $request->only(['search'])
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching stores: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to fetch stores.');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            Log::info('Store creation initiated', ['request_data' => $request->except('store_image')]);
            
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'address' => 'required|string|max:255',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'store_image' => 'nullable|file|mimes:jpeg,jpg,png,gif,svg|max:5120',
            ]);

            if ($validator->fails()) {
                Log::warning('Store validation failed', ['errors' => $validator->errors()->toArray()]);
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            // Begin transaction
            \DB::beginTransaction();
            
            $store = Store::create($validator->validated());
            Log::info('Store created', ['store_id' => $store->id]);

            if ($request->hasFile('store_image')) {
                try {
                    StoreImage::uploadImage($store->id, $request->file('store_image'), true);
                    Log::info('Store image uploaded successfully', ['store_id' => $store->id]);
                } catch (\Exception $e) {
                    Log::error('Error uploading store image', [
                        'store_id' => $store->id,
                        'error' => $e->getMessage()
                    ]);
                    throw $e;
                }
            }
            
            \DB::commit();
            
            return redirect()->route('stores.index')->with('success', 'Store created successfully.');
        } catch (\Exception $e) {
            \DB::rollBack();
            Log::error('Error creating store', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except('store_image')
            ]);
            return redirect()->back()->with('error', 'Failed to create store.')->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Store $store)
    {
        try {
            $store->load('storeImage');
            return Inertia::render('store-details', [
                'store' => $store
            ]);
        } catch (\Exception $e) {
            Log::error('Error displaying store: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to display store details.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Store $store)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'address' => 'required|string|max:255',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'store_image' => 'nullable|file|mimes:jpeg,jpg,png,gif,svg|max:5120',
            ]);

            if ($validator->fails()) {
                Log::warning('Store update validation failed', ['errors' => $validator->errors()->toArray()]);
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            // Begin transaction
            \DB::beginTransaction();
            
            $store->update($validator->validated());
            Log::info('Store updated', ['store_id' => $store->id]);

            if ($request->hasFile('store_image')) {
                try {
                    StoreImage::uploadImage($store->id, $request->file('store_image'), true);
                    Log::info('Store image updated successfully', ['store_id' => $store->id]);
                } catch (\Exception $e) {
                    Log::error('Error uploading store image', [
                        'store_id' => $store->id,
                        'error' => $e->getMessage()
                    ]);
                    throw $e;
                }
            }
            
            \DB::commit();
            
            return redirect()->route('stores.index')->with('success', 'Store updated successfully.');
        } catch (\Exception $e) {
            \DB::rollBack();
            Log::error('Error updating store', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'store_id' => $store->id,
                'request_data' => $request->except('store_image')
            ]);
            return redirect()->back()->with('error', 'Failed to update store.')->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Store $store)
    {
        try {
            $store->delete();
            return redirect()->route('stores.index')->with('success', 'Store deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Error deleting store: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete store.');
        }
    }
}
