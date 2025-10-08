<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BackupController extends Controller
{
    public function index()
    {
        $path = '/Laravel';
        $backups = Storage::disk('local')->files($path);
        $backups = array_map('basename', $backups);
        rsort($backups);

        return response()->json(['backups' => $backups]);
    }

    public function run()
    {
        Artisan::call('backup:run');
        return redirect()->back()->with('success', 'Backup created successfully!');
    }

    public function delete(Request $request)
    {
        $file = $request->input('file');
        $filePath = '/Laravel/' . $file;

        if (Storage::disk('local')->exists($filePath)) {
            Storage::disk('local')->delete($filePath);
            return response()->json(['message' => 'Backup deleted successfully!']);
        }

        return response()->json(['error' => 'Backup not found.'], 404);
    }

    public function download($file)
    {
        if (!preg_match('/\.zip$/', $file)) {
            abort(403, 'Invalid file type.');
        }

        $path = storage_path('app/private/Laravel/' . $file);

        if (file_exists($path)) {
            return response()->download($path);
        }

        return response()->json(['error' => 'Backup not found.'], 404);
    }
}