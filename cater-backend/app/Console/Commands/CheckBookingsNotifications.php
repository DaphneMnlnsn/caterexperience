<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\EventBooking;
use App\Models\User;
use Carbon\Carbon;
use App\Notifications\BookingNearNotification;
use App\Notifications\EightyPercentPaymentPendingNotification;
use App\Notifications\EventFinishedNotification;
use App\Notifications\FullPaymentPendingNotification;
use App\Services\NotificationService;

class CheckBookingsNotifications extends Command
{
    protected $signature = 'notifications:check-bookings';
    protected $description = 'Send notifications for bookings happening soon or bookings that finished and need action';

    public function handle()
    {
        $admins = User::where('role', 'admin')->get();

        $today = Carbon::now()->toDateString();
        $threeDaysFromNow = Carbon::now()->addDays(3)->toDateString();

        $bookingsNear = EventBooking::whereBetween('event_date', [$today, $threeDaysFromNow])
                            ->whereNotIn('booking_status', ['Finished', 'Cancelled'])
                            ->get();

        foreach ($bookingsNear as $booking) {
            foreach ($admins as $admin) {
                $exists = $admin->notifications()
                    ->where('type', BookingNearNotification::class)
                    ->where('data->booking_id', $booking->booking_id)
                    ->whereDate('created_at', $today)
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
                        ->whereDate('created_at', $today)
                        ->exists();

                    if (! $exists) {
                        $user->notify(new BookingNearNotification($booking));
                    }
                }
            }
        }

        $finished = EventBooking::whereDate('event_date', '<', Carbon::now()->toDateString())
            ->whereNotIn('booking_status', ['Finished', 'Cancelled'])
            ->get();

        foreach ($finished as $booking) {
            foreach ($admins as $admin) {
                $exists = $admin->notifications()
                    ->where('type', EventFinishedNotification::class)
                    ->where('data->booking_id', $booking->booking_id)
                    ->whereDate('created_at', $today)
                    ->exists();

                if (! $exists) {
                    $admin->notify(new EventFinishedNotification($booking));
                }
            }
        }

        $end = now()->addWeek()->toDateString();

        $bookingsCandidates = EventBooking::whereDate('event_date', '>=', $today)
            ->whereDate('event_date', '<=', $end)
            ->whereNotIn('booking_status', ['Finished', 'Cancelled'])
            ->with('customer')
            ->withSum('payments', 'amount_paid')
            ->get();

        $bookings80Pending = $bookingsCandidates->filter(function ($booking) {
            $paid  = (float) ($booking->payments_sum_amount_paid ?? 0);
            $total = (float) ($booking->final_amount ?? 0);

            if ($total <= 0) return false;

            return ($paid / $total) < 0.8;
        });

        foreach ($bookings80Pending as $booking) {
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                NotificationService::sendIfNotExists($admin, EightyPercentPaymentPendingNotification::class, $booking);
            }

            if ($booking->customer) {
                NotificationService::sendIfNotExists($booking->customer, EightyPercentPaymentPendingNotification::class, $booking);
            }
        }

        $bookingsUnpaid = EventBooking::whereDate('event_date', '<', now()->toDateString())
            ->with('customer')
            ->whereNotIn('booking_status', ['Finished', 'Cancelled'])
            ->withSum('payments', 'amount_paid')
            ->get();

        $bookingsUnpaid = $bookingsUnpaid->filter(function ($booking) {
            $paid  = (float) ($booking->payments_sum_amount_paid ?? 0);
            $total = (float) ($booking->final_amount ?? 0);

            if ($total <= 0) return false;

            return $paid < $total;
        });

        foreach ($bookingsUnpaid as $booking) {
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                NotificationService::sendIfNotExists($admin, FullPaymentPendingNotification::class, $booking);
            }

            if ($booking->customer) {
                NotificationService::sendIfNotExists($booking->customer, FullPaymentPendingNotification::class, $booking);
            }
        }

        $this->info('Notifications check completed.');
        return 0;
    }
}