<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/clear-all', function() {
    Artisan::call('optimize:clear');
    Artisan::call('package:discover');
    return 'Cache cleared and packages discovered!';
});

Route::get('/check-backup-command', function() {
    $commands = Artisan::all();
    $backupCommands = [];

    foreach ($commands as $name => $command) {
        if (str_contains($name, 'backup')) {
            $backupCommands[] = $name;
        }
    }

    return !empty($backupCommands)
        ? response()->json(['found' => true, 'commands' => $backupCommands])
        : response()->json(['found' => false, 'message' => 'No backup commands found.']);
});
