<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Addon;

class AddonController extends Controller
{
    public function index()
    {
        $addons = Addon::all();
        return response()->json(['addons' => $addons]);
    }
}
