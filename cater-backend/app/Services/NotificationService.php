<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\StaffAssignment;
use App\Models\User;
use App\Notifications\BookingCancelledNotification;
use App\Notifications\BookingChangeRequestNotification;
use App\Notifications\BookingUpdatedNotification;
use App\Notifications\TaskAssignedNotification;
use App\Notifications\VenueSetupApprovedNotification;
use App\Notifications\VenueSetupSubmittedNotification;
use App\Notifications\VenueUpdatedNotification;

class NotificationService
{
    /**
     * Send a task-assigned notification to a user.
     *
     * @param int $userId
     * @param \App\Models\EventBooking $booking
     */
    public static function sendTaskAssigned($userId, $booking)
    {
        $user = User::find($userId);

        if (! $user) return;

        $exists = $user->notifications()
            ->where('type', TaskAssignedNotification::class)
            ->where('data->booking_id', $booking->booking_id)
            ->exists();

        if (! $exists) {
            $user->notify(new TaskAssignedNotification($booking));
        }
    }

    public static function sendBookingUpdated($notifiableId, $booking, $isClient = false)
    {
        $notifiable = $isClient
            ? Customer::find($notifiableId)
            : User::find($notifiableId);

        if (! $notifiable) return;

        $exists = $notifiable->notifications()
            ->where('type', BookingUpdatedNotification::class)
            ->where('data->booking_id', $booking->booking_id)
            ->exists();

        if (! $exists) {
            $notifiable->notify(new BookingUpdatedNotification($booking));
        }
    }

    public static function sendBookingCancelled($notifiableId, $booking, $isClient = false)
    {
        $notifiable = $isClient
            ? Customer::find($notifiableId)
            : User::find($notifiableId);

        if (! $notifiable) return;

        $exists = $notifiable->notifications()
            ->where('type', BookingCancelledNotification::class)
            ->where('data->booking_id', $booking->booking_id)
            ->exists();

        if (! $exists) {
            $notifiable->notify(new BookingCancelledNotification($booking));
        }
    }
    public static function sendBookingChangeRequest($booking, $requestText)
    {
        $admins = User::where('role', 'admin')->get();

        foreach ($admins as $admin) {
            $exists = $admin->notifications()
                ->where('type', BookingChangeRequestNotification::class)
                ->where('data->booking_id', $booking->booking_id)
                ->exists();

            if (! $exists) {
                $admin->notify(new BookingChangeRequestNotification($booking, $requestText));
            }
        }
    }

    public static function sendVenueUpdated($booking)
    {
        $admins = User::where('role', 'admin')->get();

        foreach ($admins as $admin) {
            $exists = $admin->notifications()
                ->where('type', VenueUpdatedNotification::class)
                ->where('data->booking_id', $booking->booking_id)
                ->whereDate('created_at', now()->toDateString())
                ->exists();

            if (! $exists) {
                $admin->notify(new VenueUpdatedNotification($booking->booking_id));
            }
        }
    }

    public static function sendVenueSetupSubmitted($booking)
    {
        $customer = $booking->customer;

        if (! $customer) {
            return;
        }

        $exists = $customer->notifications()
            ->where('type', VenueSetupSubmittedNotification::class)
            ->where('data->booking_id', $booking->booking_id)
            ->whereDate('created_at', now()->toDateString())
            ->exists();

        if (! $exists) {
            $customer->notify(new VenueSetupSubmittedNotification($booking->booking_id));
        }
    }

    public static function sendVenueSetupApproved($booking)
    {
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $exists = $admin->notifications()
                ->where('type', VenueSetupApprovedNotification::class)
                ->where('data->booking_id', $booking->booking_id)
                ->whereDate('created_at', now()->toDateString())
                ->exists();

            if (! $exists) {
                $admin->notify(new VenueSetupApprovedNotification($booking->booking_id));
            }
        }

        $staffIds = StaffAssignment::where('booking_id', $booking->booking_id)
            ->pluck('user_id')
            ->toArray();

        $staffUsers = User::whereIn('id', $staffIds)
            ->whereIn('role', ['stylist', 'head waiter'])
            ->get();

        foreach ($staffUsers as $staff) {
            $exists = $staff->notifications()
                ->where('type', VenueSetupApprovedNotification::class)
                ->where('data->booking_id', $booking->booking_id)
                ->whereDate('created_at', now()->toDateString())
                ->exists();

            if (! $exists) {
                $staff->notify(new VenueSetupApprovedNotification($booking->booking_id));
            }
        }
    }

}