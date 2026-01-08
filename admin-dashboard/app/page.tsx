'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, Users, ShoppingCart, TrendingUp, Clock, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalStores: 0,
    totalRevenue: 0,
    activeDeliveries: 0,
    avgDeliveryTime: 0,
  });

  const [ordersData, setOrdersData] = useState([
    { name: 'Mon', orders: 45 },
    { name: 'Tue', orders: 52 },
    { name: 'Wed', orders: 38 },
    { name: 'Thu', orders: 65 },
    { name: 'Fri', orders: 48 },
    { name: 'Sat', orders: 72 },
    { name: 'Sun', orders: 58 },
  ]);

  useEffect(() => {
    // Fetch dashboard stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      change: '+12%',
      changeType: 'increase',
    },
    {
      title: 'Active Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: '+8%',
      changeType: 'increase',
    },
    {
      title: 'Total Stores',
      value: stats.totalStores.toLocaleString(),
      icon: Package,
      change: '+5%',
      changeType: 'increase',
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+23%',
      changeType: 'increase',
    },
    {
      title: 'Active Deliveries',
      value: stats.activeDeliveries.toLocaleString(),
      icon: TrendingUp,
      change: '+15%',
      changeType: 'increase',
    },
    {
      title: 'Avg Delivery Time',
      value: `${stats.avgDeliveryTime} min`,
      icon: Clock,
      change: '-2 min',
      changeType: 'decrease',
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs text-muted-foreground ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Orders</CardTitle>
              <CardDescription>
                Order volume over the past 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ordersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Stores</CardTitle>
                <CardDescription>
                  Stores with highest order volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Store A - Downtown</span>
                    <span className="font-bold">342 orders</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Store B - Uptown</span>
                    <span className="font-bold">287 orders</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Store C - Suburbs</span>
                    <span className="font-bold">198 orders</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
                <CardDescription>
                  Key delivery metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>On-time Delivery Rate</span>
                    <span className="font-bold text-green-600">94.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Rating</span>
                    <span className="font-bold">4.7/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion Rate</span>
                    <span className="font-bold text-green-600">98.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest platform activities and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-gray-200 pl-4">
                  <div className="text-sm">
                    <p className="font-medium">New store registration</p>
                    <p className="text-gray-600">Fashion Hub - Downtown registered 2 hours ago</p>
                  </div>
                </div>
                <div className="border-l-4 border-gray-200 pl-4">
                  <div className="text-sm">
                    <p className="font-medium">Large order completed</p>
                    <p className="text-gray-600">Order #12345 completed in 8 minutes</p>
                  </div>
                </div>
                <div className="border-l-4 border-gray-200 pl-4">
                  <div className="text-sm">
                    <p className="font-medium">New delivery partner onboarded</p>
                    <p className="text-gray-600">John Doe completed verification</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
