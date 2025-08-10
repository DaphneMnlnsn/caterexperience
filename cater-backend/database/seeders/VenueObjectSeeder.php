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
                    'chair_w_m' => 0.45,
                    'chair_h_m' => 0.45,
                ],
                'default_scale'    => 1,
                'default_rotation' => 0,
                'z_index'          => 1,
            ],
            [
                'object_name'  => 'Single Round Table',
                'object_type'  => 'singleRoundTable',
                'object_props' => [
                    'radius_m' => 0.75,
                ],
                'default_scale'    => 1,
                'default_rotation' => 0,
                'z_index'      => 1,
            ],
            [
                'object_name'  => 'Round Table (6)',
                'object_type'  => 'roundTable',
                'object_props' => [
                    'radius_m' => 0.75,
                    'count'    => 6,
                ],
                'z_index'      => 1,
            ],
            [
                'object_name'  => 'Round Table (8)',
                'object_type'  => 'roundTable',
                'object_props' => [
                    'radius_m' => 0.75,
                    'count'    => 8,
                ],
                'z_index'      => 1,
            ],
            [
                'object_name'  => 'Square Table',
                'object_type'  => 'squareTable',
                'object_props' => [
                    'w_m' => 1.2,
                ],
                'z_index'      => 1,
            ],
            [
                'object_name'  => 'Rect Table',
                'object_type'  => 'rectTable',
                'object_props' => [
                    'w_m'       => 2.3,
                    'h_m'       => 1.1,
                    'topBottom' => 4,
                    'sides'     => 1,
                ],
                'z_index'      => 1,
            ],
            [
                'object_name'  => 'Oval Table (8)',
                'object_type'  => 'ovalTable',
                'object_props' => [
                    'rx_m'  => 1.0,
                    'ry_m'  => 0.5,
                    'count' => 8,
                ],
                'z_index'      => 1,
            ],
            [
                'object_name'  => 'Buffet Table',
                'object_type'  => 'buffetTable',
                'object_props' => [
                    'w_m'     => 5.0,
                    'h_m'     => 1.0,
                    'count'   => 6,
                ],
                'z_index'      => 1,
            ],
            [
                'object_name'  => 'Plant',
                'object_type'  => 'plant',
                'object_props' => [
                    'radius_m' => 0.5,
                    'petals'   => 6,
                ],
                'z_index'      => 1,
            ],
            [
                'object_name'  => 'Divider',
                'object_type'  => 'divider',
                'object_props' => [
                    'length_m' => 2.0,
                    'dash'     => [10, 5],
                ],
                'z_index'      => 0,
            ],
            [
                'object_name'  => 'Arch',
                'object_type'  => 'arch',
                'object_props' => [
                    'rx_m'    => 1.0,
                    'ry_m'    => 1.0,
                    'start'   => 0,
                    'end'     => 180,
                ],
                'z_index'      => 0,
            ],
            [
                'object_name'  => 'Stage',
                'object_type'  => 'stageOutline',
                'object_props' => [
                    'w_m'   => 6.0,
                    'h_m'   => 3.0,
                    'label' => 'STAGE',
                ],
                'z_index'      => 2,
            ],
            [
                'object_name'  => 'Backdrop',
                'object_type'  => 'backdropLine',
                'object_props' => [
                    'length_m' => 7,
                ],
                'z_index'      => 2,
            ],
            [
                'object_name'  => 'Light',
                'object_type'  => 'lightOutline',
                'object_props' => [
                    'radius_m' => 0.2,
                ],
                'z_index'      => 3,
            ],
            [
                'object_name'  => 'Fan',
                'object_type'  => 'fanOutline',
                'object_props' => [
                    'radius_m' => 0.3,
                ],
                'z_index'      => 3,
            ],
        ];

        foreach ($items as $item) {
            VenueObject::create(array_merge($item, [
                'object_props' => json_encode($item['object_props']),
                'archived' => false
            ]));
        }
    }
}
