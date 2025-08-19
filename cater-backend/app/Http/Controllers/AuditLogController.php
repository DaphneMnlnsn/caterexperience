<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use Illuminate\Http\Request;
use App\Models\AuditLog;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        AuditLogger::log('Viewed', 'Module: Audit Log | Viewed audit logs');

        $query = AuditLog::with('user');

        if ($request->filled('user')) {
            $term = $request->input('user');

            $query->whereHas('user', function($q) use ($term) {
                if (Schema::hasColumn('users', 'middle_name')) {
                    $q->whereRaw(
                        "CONCAT(first_name, ' ', COALESCE(middle_name, ''), ' ', last_name) LIKE ?",
                        ["%{$term}%"]
                    );
                } else {
                    $q->where('first_name', 'like', "%{$term}%")
                    ->orWhere('last_name', 'like', "%{$term}%")
                    ->orWhereRaw(
                        "CONCAT(first_name, ' ', last_name) LIKE ?",
                        ["%{$term}%"]
                    );
                }
            });
        }

        if ($request->filled('action')) {
            $query->where('action', $request->input('action'));
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('timestamp', [$request->input('start_date'), $request->input('end_date')]);
        } elseif ($request->filled('start_date')) {
            $query->where('timestamp', '>=', $request->input('start_date'));
        } elseif ($request->filled('end_date')) {
            $query->where('timestamp', '<=', $request->input('end_date'));
        }

        $logs = $query->orderBy('timestamp', 'desc')->paginate(10);

        return response()->json([
            'logs' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
                'per_page'     => $logs->perPage(),
                'total'        => $logs->total(),
            ],
        ]);
    }
    public function generateReport(Request $request)
    {
        $generatedBy = $request->input('generated_by', 'Unknown');

        $query = AuditLog::with('user');

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('timestamp', [$request->start_date, $request->end_date]);
        } elseif ($request->filled('start_date')) {
            $query->where('timestamp', '>=', $request->start_date);
        } elseif ($request->filled('end_date')) {
            $query->where('timestamp', '<=', $request->end_date);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('user')) {
            $term = $request->input('user');

            $query->whereHas('user', function ($q) use ($term) {
                if (Schema::hasColumn('users', 'middle_name')) {
                    $q->whereRaw(
                        "CONCAT(first_name, ' ', COALESCE(middle_name, ''), ' ', last_name) LIKE ?",
                        ["%{$term}%"]
                    );
                } else {
                    $q->where('first_name', 'like', "%{$term}%")
                    ->orWhere('last_name', 'like', "%{$term}%")
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$term}%"]);
                }
            });
        }

        $logs = $query->orderBy('timestamp', 'asc')->get();

        $totalLogs = $logs->count();

        $pdf = Pdf::loadView('reports.audit', [
            'logs'        => $logs,
            'startDate'   => $request->start_date,
            'endDate'     => $request->end_date,
            'action'      => $request->action,
            'search'      => $request->user,
            'generatedBy' => $generatedBy,
            'totalLogs'   => $totalLogs,
        ]);

        AuditLogger::log('Viewed', 'Module: Audit | Generated audit report PDF');

        return $pdf->stream('audit-report.pdf');
    }
}
