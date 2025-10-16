<?php

namespace App\Console\Commands;

use App\Helpers\AuditLogger;
use Illuminate\Console\Command;
use App\Models\Booking;
use App\Models\BookingInventory;
use App\Models\EventBooking;
use App\Models\Inventory;
use Illuminate\Support\Facades\DB;

class DeductInventoryOnEventDate extends Command
{
    protected $signature = 'inventory:deduct-on-event';
    protected $description = 'Automatically deduct assigned inventory quantities from main inventory on the event date.';

    public function handle()
    {
        $today = now()->toDateString();

        DB::beginTransaction();

        try {
            $bookings = EventBooking::whereDate('event_date', $today)->pluck('booking_id');

            if ($bookings->isEmpty()) {
                $this->info("No bookings scheduled for today ({$today}).");
                return 0;
            }

            $bookingInventories = BookingInventory::with('item', 'usage')
                ->whereIn('booking_id', $bookings)
                ->get();

            $totalUpdated = 0;

            foreach ($bookingInventories as $bInv) {
                $item = $bInv->item;
                if (!$item) continue;

                $usedQty = $bInv->usage->quantity_used ?? 0;
                if ($usedQty <= 0) continue;

                $oldQty = $item->item_current_quantity;
                $item->item_current_quantity = max(0, $oldQty - $usedQty);
                $item->save();

                $totalUpdated++;

                AuditLogger::log('Updated', "Module: Inventory | Deducted {$usedQty} from item '{$item->item_name}' for Booking ID: {$bInv->booking_id}");
            }

            DB::commit();

            $this->info("Deducted inventory for {$totalUpdated} item(s) from today's bookings ({$today}).");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Error deducting inventory: ' . $e->getMessage());
        }

        return 0;
    }
}