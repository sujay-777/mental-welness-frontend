import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaChartLine, 
  FaChartBar, 
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaComments
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AnalyticsCharts = () => {
  const [appointmentAnalytics, setAppointmentAnalytics] = useState(null);
  const [engagementAnalytics, setEngagementAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const [appointmentResponse, engagementResponse] = await Promise.all([
        axios.get(`${API_URL}/admin/analytics/appointments?period=${selectedPeriod}`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        }),
        axios.get(`${API_URL}/admin/analytics/engagement`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        })
      ]);

      setAppointmentAnalytics(appointmentResponse.data);
      setEngagementAnalytics(engagementResponse.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const ChartCard = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-xl p-6 shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );

  const SimpleBarChart = ({ data, title, color = "blue" }) => {
    if (!data || data.length === 0) {
      return <div className="text-gray-500 text-center py-8">No data available</div>;
    }

    const maxValue = Math.max(...data.map(item => item.count));
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      red: "bg-red-500",
      yellow: "bg-yellow-500"
    };

    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-24 text-sm text-gray-600 truncate">
              {item._id?.date || item._id?.year + '-' + item._id?.month || item._id}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className={`${colorClasses[color]} h-4 rounded-full transition-all duration-300`}
                style={{ width: `${(item.count / maxValue) * 100}%` }}
              ></div>
            </div>
            <div className="w-12 text-sm font-medium text-gray-700 text-right">
              {item.count}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const PerformanceTable = ({ data, title }) => {
    if (!data || data.length === 0) {
      return <div className="text-gray-500 text-center py-8">No data available</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Total</th>
              <th className="text-left py-2">Completed</th>
              <th className="text-left py-2">Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-2 font-medium">{item.therapistName || item.userName}</td>
                <td className="py-2">{item.totalAppointments || item.chatSessions}</td>
                <td className="py-2">{item.completedAppointments || item.totalMessages}</td>
                <td className="py-2">
                  <span className="text-green-600 font-medium">
                    {item.completionRate ? `${item.completionRate.toFixed(1)}%` : 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Analytics & Trends</h2>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button 
            onClick={fetchAnalytics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Appointment Analytics */}
      {appointmentAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title={`Daily Appointment Breakdown (${selectedPeriod})`}>
            <SimpleBarChart 
              data={appointmentAnalytics.dailyBreakdown} 
              color="blue"
            />
          </ChartCard>

          <ChartCard title="Therapist Performance">
            <PerformanceTable 
              data={appointmentAnalytics.therapistPerformance} 
            />
          </ChartCard>
        </div>
      )}

      {/* Engagement Analytics */}
      {engagementAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="User Registration Trends (Last 6 Months)">
            <SimpleBarChart 
              data={engagementAnalytics.userRegistrationTrends} 
              color="green"
            />
          </ChartCard>

          <ChartCard title="User Activity Statistics">
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {engagementAnalytics.activeUsers}
                </div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Most Active Users:</h4>
                {engagementAnalytics.userActivityStats.slice(0, 5).map((user, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.appointmentCount} appointments</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.lastAppointment ? new Date(user.lastAppointment).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>
      )}

      {/* Chat Engagement */}
      {engagementAnalytics && (
        <ChartCard title="Chat Engagement Statistics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Top Chat Users:</h4>
              <PerformanceTable 
                data={engagementAnalytics.chatEngagement} 
              />
            </div>
            
            <div className="space-y-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {engagementAnalytics.chatEngagement?.reduce((sum, user) => sum + user.totalMessages, 0) || 0}
                </div>
                <div className="text-sm text-gray-600">Total Messages</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {engagementAnalytics.chatEngagement?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Active Chat Users</div>
              </div>
            </div>
          </div>
        </ChartCard>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointmentAnalytics?.totalAppointments || 0}
              </p>
              <p className="text-xs text-gray-500">in {selectedPeriod}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <FaCalendarAlt className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {engagementAnalytics?.activeUsers || 0}
              </p>
              <p className="text-xs text-gray-500">with appointments</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <FaUsers className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chat Sessions</p>
              <p className="text-2xl font-bold text-gray-900">
                {engagementAnalytics?.chatEngagement?.reduce((sum, user) => sum + user.chatSessions, 0) || 0}
              </p>
              <p className="text-xs text-gray-500">total sessions</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <FaComments className="text-2xl text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts; 