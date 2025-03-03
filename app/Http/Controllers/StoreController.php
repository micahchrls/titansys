<?php

namespace App\Http\Controllers;

use App\Models\Store\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoreController extends Controller
{
    public function index()
    {
        $stores = Store::paginate(10);
        return Inertia::render('stores', [
            'stores' => $stores
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'contact' => 'required|string',
            'description' => 'nullable|string'
        ]);

        Store::create($validated);

        return redirect()->back()->with('success', 'Store created successfully.');
    }

    public function update(Request $request, Store $store)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'contact' => 'required|string',
            'description' => 'nullable|string'
        ]);

        $store->update($validated);

        return redirect()->back()->with('success', 'Store updated successfully.');
    }

    public function destroy(Store $store)
    {
        $store->delete();
        return redirect()->back()->with('success', 'Store deleted successfully.');
    }
}