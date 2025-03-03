<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();

        if (empty($permissions)) {
            return $next($request);
        }

        if ($user->hasAnyPermission($permissions)) {
            return $next($request);
        }

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Unauthorized. Insufficient permissions.'], 403);
        }

        return redirect()->route('dashboard')->with('error', 'Unauthorized. Insufficient permissions.');
    }
}