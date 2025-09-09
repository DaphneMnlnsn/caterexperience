<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\EventBooking;
use App\Models\User;
use Carbon\Carbon;
use App\Notifications\BookingNearNotification;
use App\Notifications\EventFinishedNotification;

class CheckBookingsNotifications extends Command
{
    protected $signature = 'notifications:check-bookings';
    protected $description = 'Send notifications for bookings happening soon or bookings that finished and need action';

    public function handle()
    {
        $admins = User::where('role', 'admin')->get();

        $tomorrow = Carbon::now()->addDay()->toDateString();
        $bookingsNear = EventBooking::whereDate('event_date', $tomorrow)->get();

        foreach ($bookingsNear as $booking) {
            foreach ($admins as $admin) {
                $exists = $admin->notifications()
                    ->where('type', BookingNearNotification::class)
                    ->where('data->booking_id', $booking->booking_id)
                    ->exists();

                if (! $exists) {
                    $admin->notify(new BookingNearNotification($booking));
                }
            }

            if ($booking->relationLoaded('staffAssignments') || method_exists($booking, 'staffAssignments')) {
                foreach ($booking->staffAssignments as $assign) {
                    $user = $assign->user;
                    if (! $user) continue;

                    $exists = $user->notifications()
                        ->where('type', BookingNearNotification::class)
                        ->where('data->booking_id', $booking->booking_id)
                        ->exists();

                    if (! $exists) {
                        $user->notify(new BookingNearNotification($booking));
                    }
                }
            }
        }

        $finished = EventBooking::whereDate('event_date', '<', Carbon::now()->toDateString())
            ->where('booking_status', '!=', 'Finished')
            ->get();

        foreach ($finished as $booking) {
            foreach ($admins as $admin) {
                $exists = $admin->notifications()
                    ->where('type', EventFinishedNotification::class)
                    ->where('data->booking_id', $booking->booking_id)
                    ->exists();

                if (! $exists) {
                    $admin->notify(new EventFinishedNotification($booking));
                }
            }
        }

        $this->info('Notifications check completed.');
        return 0;
    }
}