import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  UserCheck, 
  Coins, 
  Gift,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { customerService } from '../services/customerService';
import { formatNumber, formatCurrency, formatDate, calculatePercentageChange } from '../utils';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard metrics and recent activities
        const [metricsResponse, activityResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/merchant/dashboard`, {
            credentials: 'include'
          }).then(res => res.json()),
          customerService.getRecentActivities()
        ]);

        setMetrics(metricsResponse || {});
        setRecentActivity((activityResponse?.activities || []).slice(0, 5));

        // Set empty chart data for now since we don't have analytics yet
        setChartData({ customerGrowth: [], pointsFlow: [], engagement: [] });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty data if API fails
        setMetrics({});
        setChartData({ customerGrowth: [], pointsFlow: [], engagement: [] });
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);



  if (loading) {
    return <LoadingSpinner fullScreen={false} />;
  }

  const stats = [
    {
      name: t('dashboard.totalCustomers'),
      value: formatNumber(metrics?.totalCustomers || 0),
      change: calculatePercentageChange(
        metrics?.totalCustomers || 0,
        metrics?.previousPeriod?.totalCustomers || 0
      ),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: t('dashboard.activeCustomers'),
      value: formatNumber(metrics?.activeCustomers || 0),
      change: calculatePercentageChange(
        metrics?.activeCustomers || 0,
        metrics?.previousPeriod?.activeCustomers || 0
      ),
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: t('dashboard.totalPoints'),
      value: formatNumber(metrics?.totalPoints || 0),
      change: calculatePercentageChange(
        metrics?.totalPoints || 0,
        metrics?.previousPeriod?.totalPoints || 0
      ),
      icon: Coins,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      name: t('dashboard.totalRewards'),
      value: formatNumber(metrics?.totalRewards || 0),
      change: calculatePercentageChange(
        metrics?.totalRewards || 0,
        metrics?.previousPeriod?.totalRewards || 0
      ),
      icon: Gift,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-gray-100">
            {t('dashboard.title')}
          </h1>
          <p className="text-secondary-600 dark:text-gray-400 mt-1">
            {t('dashboard.welcome')}
          </p>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Calendar className="h-5 w-5 text-secondary-400 dark:text-gray-500" />
          <span className="text-sm text-secondary-600 dark:text-gray-400">
            {formatDate(new Date(), 'PPP')}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;

          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-smooth border border-secondary-100 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-secondary-900 dark:text-gray-100 mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2 space-x-1 rtl:space-x-reverse">
                    {isPositive ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {Math.abs(stat.change).toFixed(1)}%
                    </span>
                    <span className="text-xs text-secondary-500 dark:text-gray-500">
                      vs last month
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} dark:bg-opacity-20 rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat.color} dark:opacity-80`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-smooth border border-secondary-100 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-gray-100">
              {t('dashboard.customerGrowth')}
            </h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData?.customerGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="customers"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Engagement Levels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-smooth border border-secondary-100 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-gray-100">
              {t('analytics.engagementLevels')}
            </h3>
            <Activity className="h-5 w-5 text-primary-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData?.engagement || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                dataKey="value"
              >
                {(chartData?.engagement || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 rtl:space-x-reverse mt-4 flex-wrap gap-y-2">
            {(chartData?.engagement || []).map((item) => (
              <div key={item.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-secondary-600 dark:text-gray-400">
                  {t(`analytics.${item.name.toLowerCase()}`)} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-smooth border border-secondary-100 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-gray-100">
            {t('dashboard.recentActivity')}
          </h3>
          <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
            {t('common.view')} {t('common.all')}
          </button>
        </div>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => {
              const activityId = activity._id || activity.id;
              const customerName = activity.customerId?.name || 'Unknown Customer';
              const activityDescription = activity.metadata?.description || activity.event || 'Activity';
              const activityPoints = activity.points || 0;
              const activityTime = activity.timestamp || activity.time || new Date();

              return (
                <div key={activityId} className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-gray-700 last:border-b-0">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activityPoints > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {activityPoints > 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-900 dark:text-gray-100">
                        {customerName}
                      </p>
                      <p className="text-xs text-secondary-500 dark:text-gray-400">
                        {activityDescription}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      activityPoints > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {activityPoints > 0 ? '+' : ''}{activityPoints} {t('customers.points')}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-gray-400">
                      {formatDate(activityTime, 'p')}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-secondary-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-secondary-500 dark:text-gray-400">No recent activity</p>
              <p className="text-sm text-secondary-400 dark:text-gray-500 mt-1">
                Customer activities will appear here once they start earning or redeeming points
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 