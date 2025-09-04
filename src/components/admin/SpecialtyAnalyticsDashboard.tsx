import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useSpecialtyAnalytics } from '@/hooks/useSpecialtyAnalytics';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Target, Activity, 
  AlertTriangle, Lightbulb, Award, ChevronRight 
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const SpecialtyAnalyticsDashboard: React.FC = () => {
  const {
    specialtyStats,
    trainingTypeStats,
    trendData,
    gapAnalysis,
    topSpecialties,
    topTrainingTypes,
    totalSelections,
    dateRange,
    setDateRange,
    loading,
    refetch
  } = useSpecialtyAnalytics();

  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Specialty Analytics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Specialty Analytics</h2>
          <p className="text-muted-foreground">
            Track specialty trends, usage patterns, and market opportunities
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={(range) => setDateRange(range || dateRange)}
          />
          <Button onClick={refetch} variant="outline">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Selections</p>
                <p className="text-2xl font-bold">{totalSelections.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Specialties</p>
                <p className="text-2xl font-bold">{specialtyStats.length}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-muted-foreground">Across {new Set(specialtyStats.map(s => s.category_name)).size} categories</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Training Types</p>
                <p className="text-2xl font-bold">{trainingTypeStats.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-muted-foreground">
                Avg. {(trainingTypeStats.reduce((sum, t) => sum + t.conversion_rate, 0) / trainingTypeStats.length || 0).toFixed(1)}% conversion
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Market Gaps</p>
                <p className="text-2xl font-bold">{gapAnalysis?.underrepresented_specialties.length || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-orange-600">Opportunities identified</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="specialties">Specialties</TabsTrigger>
          <TabsTrigger value="training-types">Training Types</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="gaps">Market Gaps</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Specialties Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Specialties</CardTitle>
                <CardDescription>Based on trainer selections in the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topSpecialties.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="specialty_name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage_count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Specialty Categories Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Specialty Categories</CardTitle>
                <CardDescription>Distribution across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(
                        specialtyStats.reduce((acc, stat) => {
                          acc[stat.category_name] = (acc[stat.category_name] || 0) + stat.usage_count;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.keys(
                        specialtyStats.reduce((acc, stat) => {
                          acc[stat.category_name] = true;
                          return acc;
                        }, {} as Record<string, boolean>)
                      ).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="specialties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Specialty Performance</CardTitle>
              <CardDescription>Detailed breakdown of all specialties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {specialtyStats.map((specialty, index) => (
                  <div key={specialty.specialty_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <h4 className="font-medium">{specialty.specialty_name}</h4>
                        <p className="text-sm text-muted-foreground">{specialty.category_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">{specialty.usage_count}</p>
                        <p className="text-sm text-muted-foreground">selections</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{specialty.trainer_count}</p>
                        <p className="text-sm text-muted-foreground">trainers</p>
                      </div>
                      <div className="w-20">
                        <Progress 
                          value={(specialty.usage_count / Math.max(...specialtyStats.map(s => s.usage_count))) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training-types" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Type Analytics</CardTitle>
              <CardDescription>Performance metrics for different training delivery formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingTypeStats.map((type, index) => (
                  <div key={type.training_type_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <h4 className="font-medium">{type.training_type_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {type.conversion_rate.toFixed(1)}% conversion rate
                          </span>
                          {type.conversion_rate > 50 && (
                            <Award className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">{type.usage_count}</p>
                        <p className="text-sm text-muted-foreground">selections</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{type.client_matches}</p>
                        <p className="text-sm text-muted-foreground">matches</p>
                      </div>
                      <div className="w-20">
                        <Progress 
                          value={type.conversion_rate} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Specialty Selection Trends</CardTitle>
              <CardDescription>Historical trends over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="total_selections" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-6">
          {gapAnalysis && (
            <>
              {/* Underrepresented Specialties */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Underrepresented Specialties
                  </CardTitle>
                  <CardDescription>
                    High demand but low trainer supply - market opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gapAnalysis.underrepresented_specialties.map((specialty, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">
                        <div>
                          <h4 className="font-medium">{specialty.specialty_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Gap Score: {specialty.gap_score}/100
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">{specialty.demand_indicators}</p>
                            <p className="text-sm text-muted-foreground">demand signals</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{specialty.trainer_count}</p>
                            <p className="text-sm text-muted-foreground">trainers</p>
                          </div>
                          <Button size="sm" variant="outline">
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Market Opportunities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-500" />
                    Market Opportunities
                  </CardTitle>
                  <CardDescription>
                    Specialty combinations with high potential
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gapAnalysis.market_opportunities.map((opportunity, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                        <div>
                          <h4 className="font-medium">
                            {opportunity.specialty_combination.join(' + ')}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            High-potential specialty combination
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">{opportunity.potential_demand}%</p>
                            <p className="text-sm text-muted-foreground">potential demand</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{opportunity.current_supply}%</p>
                            <p className="text-sm text-muted-foreground">current supply</p>
                          </div>
                          <Button size="sm" variant="outline">
                            Analyze
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trending Specialties */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Trending Specialties
                  </CardTitle>
                  <CardDescription>
                    Fast-growing specialties to watch
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {gapAnalysis.trending_specialties.map((specialty, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-green-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{specialty.specialty_name}</h4>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            +{specialty.growth_rate}%
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {specialty.recent_selections} recent selections
                        </p>
                        <div className="mt-2">
                          <Progress value={specialty.growth_rate} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};