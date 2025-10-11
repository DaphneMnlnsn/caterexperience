<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\StaffAssignment;
use App\Models\User;
use App\Notifications\BookingCancelledNotification;
use App\Notifications\BookingChangeRequestNotification;
use App\Notifications\BookingUpdatedNotification;
use App\Notifications\InformationUpdatedNotification;
use App\Notifications\PasswordResettedNotification;
use App\Notifications\TaskAssignedNotification;
use App\Notifications\VenueSetupApprovedNotification;
use App\Notifications\VenueSetupRejectedNotification;
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

        $user->notify(new TaskAssignedNotification($booking));
    }

    public static function sendBookingUpdated($notifiableId, $booking, $isClient = false)
    {
        $notifiable = $isClient
            ? Customer::find($notifiableId)
            : User::find($notifiableId);

        if (! $notifiable) return;

        $notifiable->notify(new BookingUpdatedNotification($booking));
    }

    public static function sendPasswordResetted($notifiableId, $isClient = false)
    {
        $notifiable = $isClient
            ? Customer::find($notifiableId)
            : User::find($notifiableId);

        if (! $notifiable) return;

        $notifiable->notify(new PasswordResettedNotification());
    }

    public static function sendInformationUpdated($notifiableId, $isClient = false)
    {
        $notifiable = $isClient
            ? Customer::find($notifiableId)
            : User::find($notifiableId);

        if (! $notifiable) return;

        $notifiable->notify(new InformationUpdatedNotification());
    }

    public static function sendBookingCancelled($notifiableId, $booking, $isClient = false)
    {
        $notifiable = $isClient
            ? Customer::find($notifiableId)
            : User::find($notifiableId);

        if (! $notifiable) return;

        $notifiable->notify(new BookingCancelledNotification($booking));
    }
    public static function sendBookingChangeRequest($booking, $requestText)
    {
        $admins = User::where('role', 'admin')->get();

        foreach ($admins as $admin) {
            $admin->notify(new BookingChangeRequestNotification($booking, $requestText));
        }
    }

    public static function sendVenueUpdated($booking)
    {
        $admins = User::where('role', 'admin')->get();

        foreach ($admins as $admin) {
            $admin->notify(new VenueUpdatedNotification($booking->booking_id));
        }
    }

    public static function sendVenueSetupSubmitted($booking)
    {
        $customer = $booking->customer;

        if (! $customer) {
            return;
        }

        $customer->notify(new VenueSetupSubmittedNotification($booking->booking_id));
    }

    public static function sendVenueSetupApproved($booking)
    {
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new VenueSetupApprovedNotification($booking->booking_id));
        }

        $staffIds = StaffAssignment::where('booking_id', $booking->booking_id)
            ->pluck('user_id')
            ->toArray();

        $staffUsers = User::whereIn('id', $staffIds)
            ->whereIn('role', ['stylist', 'head waiter'])
            ->get();

        foreach ($staffUsers as $staff) {
            $staff->notify(new VenueSetupApprovedNotification($booking->booking_id));
        }
    }
    public static function sendVenueSetupRejected($booking)
    {
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new VenueSetupRejectedNotification($booking->booking_id));
        }

        $staffIds = StaffAssignment::where('booking_id', $booking->booking_id)
            ->pluck('user_id')
            ->toArray();

        $staffUsers = User::whereIn('id', $staffIds)
            ->whereIn('role', ['stylist', 'head waiter'])
            ->get();

        foreach ($staffUsers as $staff) {
            $staff->notify(new VenueSetupRejectedNotification($booking->booking_id));
        }
    }
    
    public static function sendIfNotExists($notifiable, $notificationClass, $booking)
    {
        if (! $notifiable) return;

        $exists = $notifiable->notifications()
            ->where('type', $notificationClass)
            ->where('data->booking_id', $booking->booking_id)
            ->whereDate('created_at', now()->toDateString())
            ->exists();

        if (! $exists) {
            $notifiable->notify(new $notificationClass($booking));
        }
    }

}