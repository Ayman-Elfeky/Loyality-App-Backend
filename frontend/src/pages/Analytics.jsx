import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Gift,
  Coins,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Percent
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { formatNumber, formatCurrency, formatDate, formatPercentage, calculatePercentageChange } from '../utils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Analytics = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('customers');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getDashboardMetrics(timeRange);
      setAnalytics(response || {
        overview: {},
        customerGrowth: [],
        pointsFlow: [],
        rewardPerformance: [],
        customerSegments: [],
        topCustomers: []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics({
        overview: {},
        customerGrowth: [],
        pointsFlow: [],
        rewardPerformance: [],
        customerSegments: [],
        topCustomers: []
      });
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen={false} />;
  }

  // Safely destructure analytics data with fallbacks
  const overview = analytics?.overview || {};
  const customerGrowth = analytics?.customerGrowth || [];
  const pointsFlow = analytics?.pointsFlow || [];
  const rewardPerformance = analytics?.rewardPerformance || [];
  const customerSegments = analytics?.customerSegments || [];
  const topCustomers = analytics?.topCustomers || [];

  const overviewStats = [
    {
      name: 'Total Customers',
      value: formatNumber(overview.totalCustomers || 0),
      change: calculatePercentageChange(overview.totalCustomers || 0, overview.previousPeriod?.totalCustomers || 0),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Active Customers',
      value: formatNumber(overview.activeCustomers || 0),
      change: overview.customerGrowth || 0,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Points Issued',
      value: formatNumber(overview.totalPointsIssued || 0),
      change: calculatePercentageChange(overview.totalPointsIssued || 0, overview.previousPeriod?.totalPointsIssued || 0),
      icon: Coins,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      name: 'Points Redeemed',
      value: formatNumber(overview.totalPointsRedeemed || 0),
      change: calculatePercentageChange(overview.totalPointsRedeemed || 0, overview.previousPeriod?.totalPointsRedeemed || 0),
      icon: Gift,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Conversion Rate',
      value: formatPercentage((overview.conversionRate || 0) / 100),
      change: overview.redemptionGrowth || 0,
      icon: Percent,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    },
    {
      name: 'Avg Points/Customer',
      value: formatNumber(overview.avgPointsPerCustomer || 0),
      change: 12.4,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            {t('analytics.title')}
          </h1>
          <p className="text-secondary-600 mt-1">
            {t('analytics.trackPerformance')}
          </p>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <select
            className="input w-auto"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7days">{t('analytics.7days')}</option>
            <option value="30days">{t('analytics.30days')}</option>
            <option value="90days">{t('analytics.90days')}</option>
            <option value="1year">{t('analytics.1year')}</option>
          </select>
          <button className="btn btn-outline">
            <Download className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
            {t('common.export')}
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;

          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex items-center">
                  {isPositive ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-xs font-medium ml-1 ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(stat.change).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-900">
                  {stat.value}
                </p>
                <p className="text-sm text-secondary-600 mt-1">
                  {stat.name}
                </p>
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
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-secondary-900">
              Customer Growth
            </h3>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <select
                className="input-sm"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                <option value="newCustomers">New Customers</option>
                <option value="activeCustomers">Active Customers</option>
                <option value="totalCustomers">Total Customers</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} />
              <Tooltip 
                formatter={(value, name) => [formatNumber(value), name]}
                labelFormatter={(value) => formatDate(new Date(value), 'MMM dd, yyyy')}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Points Flow Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-secondary-900">
              Points Flow
            </h3>
            <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 rtl:mr-0 rtl:ml-2" />
                <span>Issued</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2 rtl:mr-0 rtl:ml-2" />
                <span>Redeemed</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={pointsFlow}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} />
              <Tooltip 
                formatter={(value, name) => [formatNumber(value), name]}
                labelFormatter={(value) => formatDate(new Date(value), 'MMM dd, yyyy')}
              />
              <Line
                type="monotone"
                dataKey="issued"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="redeemed"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reward Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-6">
            Reward Performance
          </h3>
          <div className="space-y-4">
            {rewardPerformance.map((reward, index) => (
              <div key={reward.name} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p className="font-medium text-secondary-900">{reward.name}</p>
                  <p className="text-sm text-secondary-600">
                    {formatNumber(reward.redemptions)} redemptions
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-600">
                    {formatPercentage(reward.conversionRate / 100)}
                  </p>
                  <p className="text-xs text-secondary-500">conversion</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Customer Segments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-6">
            Customer Segments
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={customerSegments}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
              >
                {customerSegments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {customerSegments.map((segment) => (
              <div key={segment.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2 rtl:mr-0 rtl:ml-2"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm text-secondary-600">{segment.name}</span>
                </div>
                <span className="text-sm font-medium text-secondary-900">
                  {formatNumber(segment.customers)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-6">
            Top Customers
          </h3>
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-700">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">{customer.name}</p>
                    <p className="text-xs text-secondary-500">{customer.tier}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-600">
                    {formatNumber(customer.points)}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {formatCurrency(customer.spent)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics; 