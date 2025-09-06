import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Database,
  Activity,
  ExternalLink,
  ChevronRight,
  Calendar,
  Settings
} from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useTrainerCustomRequests } from '@/hooks/useQualifications';
import { useTrainerCustomSpecialtyRequests } from '@/hooks/useSpecialties';
import { useTrainerVerification } from '@/hooks/useTrainerVerification';
import { supabase } from '@/integrations/supabase/client';

interface AdminAnalyticsDashboardProps {
  onNavigate?: (tab: string) => void;
}

export const AdminAnalyticsDashboard = ({ onNavigate }: AdminAnalyticsDashboardProps) => {
  const { users, loading: usersLoading } = useUserRoles();
  const { data: qualificationRequests } = useTrainerCustomRequests();
  const { requests: specialtyRequests } = useTrainerCustomSpecialtyRequests();
  const { verificationRequests, loading: verificationLoading } = useTrainerVerification();
  
  const [systemMetrics, setSystemMetrics] = useState({
    uptime: 99.9,
    responseTime: 145,
    errorRate: 0.01
  });
  const [previousPeriodData, setPreviousPeriodData] = useState({
    totalUsers: 0,
    trainerCount: 0,
    clientCount: 0
  });

  // Calculate key metrics
  const totalUsers = users?.length || 0;
  const trainerCount = users?.filter(u => u.roles?.includes('trainer')).length || 0;
  const clientCount = users?.filter(u => u.roles?.includes('client')).length || 0;
  const adminCount = users?.filter(u => u.roles?.includes('admin')).length || 0;
  
  const pendingVerifications = verificationRequests?.filter(v => v.status === 'pending').length || 0;
  const verifiedTrainers = verificationRequests?.filter(v => v.status === 'approved').length || 0;
  
  const pendingQualifications = qualificationRequests?.filter(q => q.status === 'pending').length || 0;
  const pendingSpecialties = specialtyRequests?.filter(s => s.status === 'pending').length || 0;
  const totalPendingRequests = pendingVerifications + pendingQualifications + pendingSpecialties;

  // Calculate growth percentages
  const userGrowth = previousPeriodData.totalUsers > 0 
    ? Math.round(((totalUsers - previousPeriodData.totalUsers) / previousPeriodData.totalUsers) * 100)
    : 0;
  
  const trainerGrowth = previousPeriodData.trainerCount > 0
    ? Math.round(((trainerCount - previousPeriodData.trainerCount) / previousPeriodData.trainerCount) * 100)
    : 0;

  // Fetch historical data for growth calculations
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: historicalUsers } = await supabase
          .from('profiles')
          .select('user_type')
          .lt('created_at', thirtyDaysAgo.toISOString());
        
        if (historicalUsers) {
          const historicalTrainers = historicalUsers.filter(u => u.user_type === 'trainer').length;
          const historicalClients = historicalUsers.filter(u => u.user_type === 'client').length;
          
          setPreviousPeriodData({
            totalUsers: historicalUsers.length,
            trainerCount: historicalTrainers,
            clientCount: historicalClients
          });
        }
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    fetchHistoricalData();
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toString(),
      change: userGrowth > 0 ? `+${userGrowth}% this month` : userGrowth < 0 ? `${userGrowth}% this month` : "No change",
      icon: Users,
      gradient: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      iconBg: "bg-blue-500",
      textColor: "text-blue-900",
      valueColor: "text-blue-700",
      changeColor: "text-blue-600",
      breakdown: `${trainerCount} trainers, ${clientCount} clients, ${adminCount} admins`,
      onClick: () => onNavigate?.('users')
    },
    {
      title: "Pending Requests",
      value: totalPendingRequests.toString(),
      change: totalPendingRequests > 0 ? `${totalPendingRequests} need attention` : "All caught up!",
      icon: AlertTriangle,
      gradient: totalPendingRequests > 0 ? "from-orange-50 to-orange-100" : "from-green-50 to-green-100",
      border: totalPendingRequests > 0 ? "border-orange-200" : "border-green-200",
      iconBg: totalPendingRequests > 0 ? "bg-orange-500" : "bg-green-500",
      textColor: totalPendingRequests > 0 ? "text-orange-900" : "text-green-900",
      valueColor: totalPendingRequests > 0 ? "text-orange-700" : "text-green-700",
      changeColor: totalPendingRequests > 0 ? "text-orange-600" : "text-green-600",
      breakdown: `${pendingVerifications} verifications, ${pendingQualifications} qualifications, ${pendingSpecialties} specialties`,
      onClick: () => onNavigate?.('users')
    },
    {
      title: "Verified Trainers",
      value: verifiedTrainers.toString(),
      change: `${Math.round((verifiedTrainers / trainerCount) * 100)}% of trainers verified`,
      icon: CheckCircle,
      gradient: "from-green-50 to-green-100",
      border: "border-green-200",
      iconBg: "bg-green-500",
      textColor: "text-green-900",
      valueColor: "text-green-700",
      changeColor: "text-green-600",
      breakdown: `${pendingVerifications} pending verification`,
      onClick: () => onNavigate?.('users')
    },
    {
      title: "System Health",
      value: `${systemMetrics.uptime}%`,
      change: `${systemMetrics.responseTime}ms avg response`,
      icon: Activity,
      gradient: "from-emerald-50 to-emerald-100",
      border: "border-emerald-200",
      iconBg: "bg-emerald-500",
      textColor: "text-emerald-900",
      valueColor: "text-emerald-700",
      changeColor: "text-emerald-600",
      breakdown: `${systemMetrics.errorRate}% error rate`,
      onClick: () => onNavigate?.('system')
    }
  ];

  if (usersLoading || verificationLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="w-5 h-5 bg-muted rounded"></div>
              </div>
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${stat.border} bg-gradient-to-br ${stat.gradient}`}
              onClick={stat.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full ${stat.iconBg} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <ChevronRight className={`h-5 w-5 ${stat.changeColor}`} />
                </div>
                <h3 className={`font-semibold ${stat.textColor} mb-1`}>{stat.title}</h3>
                <div className={`text-3xl font-bold ${stat.valueColor} mb-2`}>{stat.value}</div>
                <p className={`text-sm ${stat.changeColor} mb-1`}>{stat.change}</p>
                <p className={`text-xs ${stat.changeColor} opacity-75`}>{stat.breakdown}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100"
          onClick={() => onNavigate?.('users')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-purple-500 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-purple-900 mb-1">Review Verifications</h3>
            <div className="text-3xl font-bold text-purple-700 mb-2">{pendingVerifications}</div>
            <p className="text-sm text-purple-600">Trainers awaiting review</p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100"
          onClick={() => onNavigate?.('content')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-amber-500 text-white">
                <Clock className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-amber-900 mb-1">Custom Requests</h3>
            <div className="text-3xl font-bold text-amber-700 mb-2">{pendingQualifications + pendingSpecialties}</div>
            <p className="text-sm text-amber-600">Requests pending approval</p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100"
          onClick={() => window.open('/documentation', '_blank')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-slate-500 text-white">
                <Database className="h-6 w-6" />
              </div>
              <ExternalLink className="h-5 w-5 text-slate-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Documentation</h3>
            <div className="text-3xl font-bold text-slate-700 mb-2">API</div>
            <p className="text-sm text-slate-600">System architecture & guides</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};