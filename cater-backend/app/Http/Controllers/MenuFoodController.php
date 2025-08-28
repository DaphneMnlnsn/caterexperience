<?php

namespace App\Http\Controllers;

use App\Models\EventBooking;
use App\Models\MenuFood;
use Illuminate\Http\Request;
use Carbon\Carbon;

class MenuFoodController extends Controller
{
    public function index(EventBooking $booking)
    {
        $items = $booking->menuFoods()
            ->get()
            ->map(function ($item) use ($booking) {
                $eventStart = Carbon::parse("{$booking->event_date} {$booking->event_start_time}");
                return [
                    'id'             => $item->id,
                    'food_name'      => $item->food->food_name ?? null,
                    'quantity_label' => $booking->pax,
                    'category'       => $item->food->food_type ?? null,
                    'deadline'       => $eventStart->copy()->subHours(2)->format('Y-m-d H:i:s'),
                    'status'         => $item->status,
                    'completed_at'   => $item->completed_at,
                ];
            });

        return response()->json(['items' => $items]);
    }


    public function batchUpdate(Request $request)
    {
        $data = $request->validate([
            'items'                => 'required|array',
            'items.*.id'           => 'required|exists:menu_food,id',
            'items.*.status'       => 'required|in:pending,completed',
        ]);

        foreach ($data['items'] as $itemData) {
            $menuFood = MenuFood::find($itemData['id']);
            if ($menuFood) {
                $menuFood->status = $itemData['status'];
                if ($itemData['status'] === 'completed') {
                    $menuFood->completed_at = now();
                } else {
                    $menuFood->completed_at = null;
                }
                $menuFood->save();
            }
        }

        return response()->json(['message' => 'Menu items updated successfully']);
    }
}