<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Finance Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 13px;
            margin: 30px;
        }

        .header {
            text-align: center;
        }

        .header h2 {
            margin: 0;
            font-size: 20px;
        }

        .sub-header {
            text-align: center;
            margin-top: 5px;
            font-size: 14px;
        }

        .filters {
            margin-top: 20px;
            margin-bottom: 10px;
        }

        .filters p {
            margin: 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        thead {
            background-color: #f0f0f0;
        }

        th, td {
            border: 1px solid #444;
            padding: 8px;
            text-align: left;
        }

        .footer {
            margin-top: 40px;
            font-size: 12px;
            text-align: right;
        }
    </style>
</head>
<body>

    <div class="header">
        <h2>Ollinati Catering</h2>
        <div class="sub-header">Finance Report</div>
    </div>

    <div class="filters">
        @if($startDate && $endDate)
            <p><strong>Date Range:</strong> {{ \Carbon\Carbon::parse($startDate)->toFormattedDateString() }} – {{ \Carbon\Carbon::parse($endDate)->toFormattedDateString() }}</p>
        @endif

        @if($search)
            <p><strong>Filtered by Customer:</strong> {{ $search }}</p>
        @endif

        @if($method)
            <p><strong>Payment Method:</strong> {{ $method }}</p>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Amount Paid</th>
                <th>Method</th>
                <th>Date</th>
                <th>Remarks</th>
            </tr>
        </thead>
        <tbody>
            @forelse($payments as $index => $payment)
                <tr>
                    <td>{{ $payment->payment_id }}</td>
                    <td>{{ $payment->customer_name }}</td>
                    <td>PHP {{ number_format($payment->amount_paid, 2) }}</td>
                    <td>{{ $payment->payment_method }}</td>
                    <td>{{ \Carbon\Carbon::parse($payment->payment_date)->toFormattedDateString() }}</td>
                    <td>{{ $payment->remarks ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center;">No payment records found for the selected filters.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>Report generated on {{ now()->toDayDateTimeString() }}</p>
    </div>

</body>
</html>
