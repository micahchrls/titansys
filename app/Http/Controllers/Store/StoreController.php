<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Store\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class StoreController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Store::query();

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $stores = $query->latest()->paginate(10);

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
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'address' => 'required|string|max:255',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            $store = Store::create($validator->validated());

            return redirect()->route('stores.index')->with('success', 'Store created successfully.');
        } catch (\Exception $e) {
            Log::error('Error creating store: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to create store.')->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Store $store)
    {
        try {
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
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            $store->update($validator->validated());

            return redirect()->route('stores.index')->with('success', 'Store updated successfully.');
        } catch (\Exception $e) {
            Log::error('Error updating store: ' . $e->getMessage());
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
