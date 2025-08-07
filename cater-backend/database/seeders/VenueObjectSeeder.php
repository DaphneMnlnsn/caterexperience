<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VenueObject;

class VenueObjectSeeder extends Seeder
{
    public function run()
    {
        $items = [
            [
                'object_name'      => 'Chair',
                'object_type'      => 'chair',
                'object_props'     => [
                ],
                'default_scale'    => 1,
                'z_index'          => 1,
            ],
            [
                'object_name'  => 'Single Round Table',
                'object_type'  => 'singleRoundTable',
                'object_props' => [
                    'radius' => 30,
                ],
                'z_index'      => 1,
            ],
            [
                'object_name'  => 'Round Table (6)',
                'object_type'  => 'roundTable',
                'object_props' => [
                    'radius' => 30,
                    'count'  => 6,
                ],
                'z_index'      => 1,
            ],
            [
                'object_name'  => 'Round Table (8)',
                'object_type'  => 'roundTable',
                'object_props' => [
                    'radius' => 30,
                    'count'  => 8,
                ],
                'z_index'      => 1,
            ],
            [
                'object_name'  => 'Square Table',
                'object_type'  => 'squareTable',
                'object_props' => [
                    'w' => 40,
                    'h' => 40,
                ],
                'z_index'      => 1,
            ],
            [
                'object_name'  => 'Rect Table',
                'object_type'  => 'rectTable',
                'object_props' => [
                    'w'         => 60,
                    'h'         => 30,
                    'topBottom' => 4,
                    'sides'     => 1,
                ],
                'z_index'      => 1,
            ],
            [
                'object_name'  => 'Oval Table (8)',
                'object_type'  => 'ovalTable',
                'object_props' => [
                    'rx'    => 40,
                    'ry'    => 20,
                    'count' => 8,
                ],
                'z_index'      => 1,
            ],
            [
                'object_name'  => 'Buffet Table',
                'object_type'  => 'buffetTable',
                'object_props' => [
                    'w'      => 120,
                    'h'      => 20,
                    'count'  => 6,
                    'circleSpacing' => 20,
                ],
                'z_index'      => 1,
            ],
            [
                'object_name'  => 'Plant',
                'object_type'  => 'plant',
                'object_props' => [
                    'radius' => 10,
                    'petals' => 6,
                ],
                'z_index'      => 1,
            ],
            [
                'object_name'  => 'Divider',
                'object_type'  => 'divider',
                'object_props' => [
                    'length' => 100,
                    'dash'   => [10, 5],
                ],
                'z_index'      => 0,
            ],
            [
                'object_name'  => 'Arch',
                'object_type'  => 'arch',
                'object_props' => [
                    'rx'     => 50,
                    'ry'     => 50,
                    'start'  => 0,
                    'end'    => 180,
                ],
                'z_index'      => 0,
            ],
            [
                'object_name'  => 'Stage',
                'object_type'  => 'stageOutline',
                'object_props' => [
                    'w' => 80,
                    'h' => 20,
                    'label' => 'STAGE',
                ],
                'z_index'      => 2,
            ],
            [
                'object_name'  => 'Backdrop',
                'object_type'  => 'backdropLine',
                'object_props' => [
                    'length' => 80,
                ],
                'z_index'      => 2,
            ],
            [
                'object_name'  => 'Light',
                'object_type'  => 'lightOutline',
                'object_props' => [
                    'radius' => 5,
                ],
                'z_index'      => 3,
            ],
            [
                'object_name'  => 'Fan',
                'object_type'  => 'fanOutline',
                'object_props' => [
                    'armLength' => 10,
                ],
                'z_index'      => 3,
            ],
        ];

        foreach ($items as $item) {
            VenueObject::create(array_merge($item, ['archived' => false]));
        }
    }
}
