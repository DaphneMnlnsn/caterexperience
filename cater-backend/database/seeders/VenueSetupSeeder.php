<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VenueSetup;

class VenueSetupSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'booking_id'   => 16,
                'layout_name'  => "Kiana's Birthday Layout",
                'layout_type'  => 'Airconditioned Room',
                'notes'        => 'Auto-generated from booking seed data.',
                'status'       => 'pending'
            ],
            [
                'booking_id'   => 12,
                'layout_name'  => 'Secret Meeting 2 Layout',
                'layout_type'  => 'Airconditioned Room',
                'notes'        => 'Imported from booking EVT-25-ST5FST.',
                'status'       => 'accepted'
            ],
            [
                'booking_id'   => 11,
                'layout_name'  => 'Secret Meeting Layout',
                'layout_type'  => 'Custom Venue',
                'notes'        => 'Free room included.',
                'status'       => 'accepted'
            ],
            [
                'booking_id'   => 10,
                'layout_name'  => "Daphne's 23rd Birthday Layout",
                'layout_type'  => 'Pavilion',
                'notes'        => null,
                'status'       => 'pending'
            ],
            [
                'booking_id'   => 8,
                'layout_name'  => "Daphne's 21st Birthday Layout",
                'layout_type'  => 'Pavilion',
                'notes'        => 'Vegetarian option for 10 guests.',
                'status'       => 'pending'
            ],
            [
                'booking_id'   => 1,
                'layout_name'  => 'William & Daph Wedding Layout',
                'layout_type'  => 'Airconditioned Room',
                'notes'        => null,
                'status'       => 'accepted'
            ],
        ];

        foreach ($data as $item) {
            VenueSetup::create($item);
        }
    }
}