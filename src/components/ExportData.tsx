import { useLazyQuery } from '@apollo/client';
import { EXPORT_ACCOMMODATIONS_CSV, EXPORT_ROOMS_CSV, EXPORT_PAYMENTS_CSV } from '../graphql/queries';
import { Download, FileText } from 'lucide-react';

export default function ExportData() {
  const [exportAccommodations, { loading: loadingAccommodations }] = useLazyQuery(EXPORT_ACCOMMODATIONS_CSV, {
    onCompleted: (data) => {
      downloadCSV(data.exportAccommodationsCSV, 'accommodations.csv');
    },
  });

  const [exportRooms, { loading: loadingRooms }] = useLazyQuery(EXPORT_ROOMS_CSV, {
    onCompleted: (data) => {
      downloadCSV(data.exportRoomsCSV, 'rooms.csv');
    },
  });

  const [exportPayments, { loading: loadingPayments }] = useLazyQuery(EXPORT_PAYMENTS_CSV, {
    onCompleted: (data) => {
      downloadCSV(data.exportPaymentsCSV, 'payments.csv');
    },
  });

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <FileText className="w-8 h-8 mr-3 text-blue-600" />
          Export Data
        </h1>

        <p className="text-gray-600 mb-8">
          Download reports in CSV format for further analysis and record-keeping.
        </p>

        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Accommodations Report</h3>
                <p className="text-sm text-gray-600">
                  Export all accommodation registrations with participant details, payment status, and dates.
                </p>
              </div>
              <button
                onClick={() => exportAccommodations()}
                disabled={loadingAccommodations}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center"
              >
                <Download className="w-5 h-5 mr-2" />
                {loadingAccommodations ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Rooms Report</h3>
                <p className="text-sm text-gray-600">
                  Export room inventory with occupancy details, capacity, and availability status.
                </p>
              </div>
              <button
                onClick={() => exportRooms()}
                disabled={loadingRooms}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center"
              >
                <Download className="w-5 h-5 mr-2" />
                {loadingRooms ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payments Report</h3>
                <p className="text-sm text-gray-600">
                  Export all successful payment transactions with amounts, dates, and payment IDs.
                </p>
              </div>
              <button
                onClick={() => exportPayments()}
                disabled={loadingPayments}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center"
              >
                <Download className="w-5 h-5 mr-2" />
                {loadingPayments ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> CSV files can be opened with Microsoft Excel, Google Sheets, or any spreadsheet
            application. Use these exports for analytics, reporting, and record-keeping purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
