import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUsers, 
  FaUserMd, 
  FaCalendarAlt, 
  FaComments, 
  FaBell, 
  FaChartLine, 
  FaChartBar, 
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaHeart,
  FaBrain,
  FaVideo,
  FaPhone,
  FaComments as FaChat
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StatisticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/statistics`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setStats(response.data.statistics);
      setError(null);
    } catch (err) {
      setError('Failed to fetch statistics');
      console.error('Error fetching statistics:', err);
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

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        {error}
        <button 
          onClick={fetchStatistics}
          className="ml-2 text-blue-600 hover:text-blue-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const StatCard = ({ title, value, icon, color, change, subtitle }) => (
    <div className={`bg-white rounded-xl p-6 shadow-lg border-l-4 ${color} hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {change && (
            <div className={`flex items-center mt-2 text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-l-', 'bg-').replace('-500', '-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-xl p-6 shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );

  const StatusBadge = ({ status, count }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'confirmed': return 'bg-blue-100 text-blue-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
      </div>
    );
  };

  const SessionTypeBadge = ({ type, count }) => {
    const getTypeColor = (type) => {
      switch (type) {
        case 'video': return 'bg-purple-100 text-purple-800';
        case 'audio': return 'bg-blue-100 text-blue-800';
        case 'chat': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getTypeIcon = (type) => {
      switch (type) {
        case 'video': return <FaVideo className="mr-1" />;
        case 'audio': return <FaPhone className="mr-1" />;
        case 'chat': return <FaChat className="mr-1" />;
        default: return null;
      }
    };

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(type)}`}>
        {getTypeIcon(type)}
        {type.charAt(0).toUpperCase() + type.slice(1)}: {count}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Statistics</h2>
        <button 
          onClick={fetchStatistics}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          icon={<FaUsers className="text-2xl text-blue-600" />}
          color="border-l-blue-500"
          subtitle={`${stats.users.newThisMonth} new this month`}
        />
        <StatCard
          title="Total Therapists"
          value={stats.therapists.total}
          icon={<FaUserMd className="text-2xl text-purple-600" />}
          color="border-l-purple-500"
          subtitle={`${stats.therapists.active} active`}
        />
        <StatCard
          title="Total Appointments"
          value={stats.appointments.total}
          icon={<FaCalendarAlt className="text-2xl text-green-600" />}
          color="border-l-green-500"
          subtitle={`${stats.appointments.thisMonth} this month`}
        />
        <StatCard
          title="Chat Messages"
          value={stats.chat.totalMessages}
          icon={<FaComments className="text-2xl text-indigo-600" />}
          color="border-l-indigo-500"
          subtitle={`${stats.chat.messagesThisMonth} this month`}
        />
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status Breakdown */}
        <ChartCard title="Appointment Status Breakdown">
          <div className="space-y-3">
            {stats.appointments.statusBreakdown.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <StatusBadge status={status._id} count={status.count} />
                <div className="text-sm text-gray-600">
                  {((status.count / stats.appointments.total) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Session Type Breakdown */}
        <ChartCard title="Session Type Breakdown">
          <div className="space-y-3">
            {stats.appointments.sessionTypeBreakdown.map((type, index) => (
              <div key={index} className="flex items-center justify-between">
                <SessionTypeBadge type={type._id} count={type.count} />
                <div className="text-sm text-gray-600">
                  {((type.count / stats.appointments.total) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Top Performing Therapists */}
      <ChartCard title="Top Performing Therapists">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Therapist</th>
                <th className="text-left py-2">Specialization</th>
                <th className="text-left py-2">Total Appointments</th>
                <th className="text-left py-2">Completed</th>
                <th className="text-left py-2">Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {stats.therapists.topPerformers.map((therapist, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-medium">{therapist.therapistName}</td>
                  <td className="py-2 text-sm text-gray-600">
                    {Array.isArray(therapist.specialization) 
                      ? therapist.specialization.join(', ') 
                      : therapist.specialization}
                  </td>
                  <td className="py-2">{therapist.totalAppointments}</td>
                  <td className="py-2">{therapist.completedAppointments}</td>
                  <td className="py-2">
                    <span className="text-green-600 font-medium">
                      {therapist.completionRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Reminder Statistics */}
      <ChartCard title="Email Reminder Statistics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FaBell className="text-2xl text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{stats.reminders.total24h}</div>
            <div className="text-sm text-gray-600">24h Reminders</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <FaClock className="text-2xl text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{stats.reminders.total1h}</div>
            <div className="text-sm text-gray-600">1h Reminders</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <FaExclamationTriangle className="text-2xl text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{stats.reminders.total15min}</div>
            <div className="text-sm text-gray-600">15min Reminders</div>
          </div>
        </div>
      </ChartCard>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Recent Appointments">
          <div className="space-y-3">
            {stats.recentActivity.appointments.slice(0, 5).map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{appointment.userId?.name || 'User'}</div>
                  <div className="text-sm text-gray-600">
                    with {appointment.therapistId?.name || 'Therapist'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{appointment.status}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(appointment.startDateTime).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Recent Users">
          <div className="space-y-3">
            {stats.recentActivity.users.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* System Health */}
      <ChartCard title="System Health">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <FaCheckCircle className="text-2xl text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-green-600">Database</div>
            <div className="text-xs text-gray-600">{stats.systemHealth.databaseConnections}</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FaBell className="text-2xl text-blue-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-blue-600">Reminder Scheduler</div>
            <div className="text-xs text-gray-600">
              {Object.keys(stats.systemHealth.reminderScheduler).length} jobs active
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <FaComments className="text-2xl text-purple-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-purple-600">Email Service</div>
            <div className="text-xs text-gray-600">{stats.systemHealth.emailService}</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <FaClock className="text-2xl text-yellow-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-yellow-600">Last Backup</div>
            <div className="text-xs text-gray-600">
              {new Date(stats.systemHealth.lastBackup).toLocaleDateString()}
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

export default StatisticsDashboard; 