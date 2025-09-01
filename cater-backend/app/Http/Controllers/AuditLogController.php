<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use Illuminate\Http\Request;
use App\Models\AuditLog;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        AuditLogger::log('Viewed', 'Module: Audit Log | Viewed audit logs');

        $query = AuditLog::with('auditable');

        if ($request->filled('user')) {
            $term = $request->input('user');

            $query->where(function ($q) use ($term) {

                $q->orWhere(function ($q1) use ($term) {
                    $q1->where('auditable_type', 'App\Models\User')
                    ->whereExists(function ($sub) use ($term) {
                        $sub->select(DB::raw(1))
                            ->from('users')
                            ->whereColumn('auditlog.auditable_id', 'users.id')
                            ->where(function ($sq) use ($term) {
                                if (Schema::hasColumn('users', 'middle_name')) {
                                    $sq->whereRaw(
                                        "CONCAT(first_name, ' ', COALESCE(middle_name, ''), ' ', last_name) LIKE ?",
                                        ["%{$term}%"]
                                    );
                                } else {
                                    $sq->whereRaw(
                                        "CONCAT(first_name, ' ', last_name) LIKE ?",
                                        ["%{$term}%"]
                                    );
                                }
                            });
                    });
                });

                $q->orWhere(function ($q2) use ($term) {
                    $q2->where('auditable_type', 'App\Models\Customer')
                    ->whereExists(function ($sub) use ($term) {
                        $sub->select(DB::raw(1))
                            ->from('customers')
                            ->whereColumn('auditlog.auditable_id', 'customers.customer_id')
                            ->where(function ($sq) use ($term) {
                                if (Schema::hasColumn('customers', 'customer_middlename')) {
                                    $sq->whereRaw(
                                        "CONCAT(customer_firstname, ' ', COALESCE(customer_middlename, ''), ' ', customer_lastname) LIKE ?",
                                        ["%{$term}%"]
                                    );
                                } else {
                                    $sq->whereRaw(
                                        "CONCAT(customer_firstname, ' ', customer_lastname) LIKE ?",
                                        ["%{$term}%"]
                                    );
                                }
                            });
                    });
                });

            });
        }

        if ($request->filled('action')) {
            $query->where('action', $request->input('action'));
        }

        if ($request->filled('start_date')) {
            $startUtc = Carbon::parse($request->input('start_date') . ' 00:00:00', 'Asia/Manila')->setTimezone('UTC');
            $query->where('timestamp', '>=', $startUtc);
        }

        if ($request->filled('end_date')) {
            $endUtc = Carbon::parse($request->input('end_date') . ' 23:59:59', 'Asia/Manila')->setTimezone('UTC');
            $query->where('timestamp', '<=', $endUtc);
        }

        $logs = $query->orderBy('auditlog_id', 'desc')->paginate(10);

        $logs->getCollection()->transform(function ($log) {
            $auditable = $log->auditable;

            if ($auditable) {
                if ($log->auditable_type === 'App\Models\User') {
                    $log->user_name = trim(($auditable->first_name ?? '') . ' ' . ($auditable->middle_name ? $auditable->middle_name . ' ' : '') . ($auditable->last_name ?? '')) ?: 'Guest';
                    $log->role = $auditable->role ?? '-';
                } elseif ($log->auditable_type === 'App\Models\Customer') {
                    $log->user_name = trim(($auditable->customer_firstname ?? '') . ' ' . ($auditable->customer_middlename ? $auditable->customer_middlename . ' ' : '') . ($auditable->customer_lastname ?? '')) ?: 'N/A';
                    $log->role = 'client';
                } else {
                    $log->user_name = $auditable->name ?? 'N/A';
                    $log->role = $auditable->role ?? '-';
                }
            } else {
                $log->user_name = 'Guest';
                $log->role = '-';
            }

            $log->timestamp = Carbon::parse($log->timestamp)
                ->setTimezone('Asia/Manila')
                ->format('Y-m-d H:i:s');

            return $log;
        });

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

        $query = AuditLog::with('auditable');

        if ($request->filled('start_date')) {
            $startUtc = Carbon::parse($request->start_date . ' 00:00:00', 'Asia/Manila')->setTimezone('UTC');
            $query->where('timestamp', '>=', $startUtc);
        }

        if ($request->filled('end_date')) {
            $endUtc = Carbon::parse($request->end_date . ' 23:59:59', 'Asia/Manila')->setTimezone('UTC');
            $query->where('timestamp', '<=', $endUtc);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('user')) {
            $term = $request->input('user');

            $query->where(function ($q) use ($term) {

                $q->orWhere(function ($q1) use ($term) {
                    $q1->where('auditable_type', 'App\Models\User')
                    ->whereExists(function ($sub) use ($term) {
                        $sub->select(DB::raw(1))
                            ->from('users')
                            ->whereColumn('auditlog.auditable_id', 'users.id')
                            ->where(function ($sq) use ($term) {
                                if (Schema::hasColumn('users', 'middle_name')) {
                                    $sq->whereRaw(
                                        "CONCAT(first_name, ' ', COALESCE(middle_name, ''), ' ', last_name) LIKE ?",
                                        ["%{$term}%"]
                                    );
                                } else {
                                    $sq->whereRaw(
                                        "CONCAT(first_name, ' ', last_name) LIKE ?",
                                        ["%{$term}%"]
                                    );
                                }
                            });
                    });
                });

                $q->orWhere(function ($q2) use ($term) {
                    $q2->where('auditable_type', 'App\Models\Customer')
                    ->whereExists(function ($sub) use ($term) {
                        $sub->select(DB::raw(1))
                            ->from('customers')
                            ->whereColumn('auditlog.auditable_id', 'customers.customer_id')
                            ->where(function ($sq) use ($term) {
                                if (Schema::hasColumn('customers', 'customer_middlename')) {
                                    $sq->whereRaw(
                                        "CONCAT(customer_firstname, ' ', COALESCE(customer_middlename, ''), ' ', customer_lastname) LIKE ?",
                                        ["%{$term}%"]
                                    );
                                } else {
                                    $sq->whereRaw(
                                        "CONCAT(customer_firstname, ' ', customer_lastname) LIKE ?",
                                        ["%{$term}%"]
                                    );
                                }
                            });
                    });
                });

            });
        }

        $logs = $query->orderBy('timestamp', 'asc')->limit(500)->get();

        $logs->transform(function ($log) {
            $auditable = $log->auditable;

            if ($auditable) {
                if ($log->auditable_type === 'App\Models\User') {
                    $log->user_name = trim(($auditable->first_name ?? '') . ' ' . ($auditable->middle_name ? $auditable->middle_name . ' ' : '') . ($auditable->last_name ?? '')) ?: 'Guest';
                    $log->role = $auditable->role ?? '-';
                } elseif ($log->auditable_type === 'App\Models\Customer') {
                    $log->user_name = trim(($auditable->customer_firstname ?? '') . ' ' . ($auditable->customer_middlename ? $auditable->customer_middlename . ' ' : '') . ($auditable->customer_lastname ?? '')) ?: 'N/A';
                    $log->role = 'client';
                } else {
                    $log->user_name = 'Guest';
                    $log->role = '-';
                }
            }

            $log->timestamp = Carbon::parse($log->timestamp)
                ->setTimezone('Asia/Manila')
                ->format('Y-m-d H:i:s');

            return $log;
        });

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
