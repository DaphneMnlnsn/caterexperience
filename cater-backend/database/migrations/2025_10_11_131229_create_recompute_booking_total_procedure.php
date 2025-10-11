<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared('
            CREATE PROCEDURE recompute_booking_total(IN bookingId BIGINT)
            BEGIN
                DECLARE packagePrice DECIMAL(10,2);
                DECLARE addonTotal DECIMAL(10,2);
                DECLARE extraChargesTotal DECIMAL(10,2);
                DECLARE eventStart TIME;
                DECLARE eventEnd TIME;
                DECLARE totalHours DECIMAL(5,2);
                DECLARE extraHourCharge DECIMAL(10,2);
                DECLARE total DECIMAL(10,2);

                SELECT pp.price_amount, eb.event_start_time, eb.event_end_time
                INTO packagePrice, eventStart, eventEnd
                FROM event_booking eb
                JOIN package_price pp ON eb.package_price_id = pp.package_price_id
                WHERE eb.booking_id = bookingId;

                SELECT IFNULL(SUM(total_price), 0)
                INTO addonTotal
                FROM event_addon
                WHERE booking_id = bookingId;

                SELECT IFNULL(SUM(amount), 0)
                INTO extraChargesTotal
                FROM extra_charges
                WHERE booking_id = bookingId;

                SET totalHours = TIME_TO_SEC(TIMEDIFF(eventEnd, eventStart)) / 3600;

                IF totalHours > 4 THEN
                    SET extraHourCharge = (totalHours - 4) * 500;
                ELSE
                    SET extraHourCharge = 0;
                END IF;

                SET total = packagePrice + addonTotal + extraChargesTotal + extraHourCharge;

                UPDATE event_booking
                SET event_total_price = total
                WHERE booking_id = bookingId;
            END
        ');
    }

    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS recompute_booking_total');
    }
};