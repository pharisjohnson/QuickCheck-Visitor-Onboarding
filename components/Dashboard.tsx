
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Visit } from '../types';
import { puterService } from '../services/puterService';
import { SpinnerIcon } from './icons';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({ today: 0, returning: 0, topHost: 'N/A' });
    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const visits: Visit[] = await puterService.getVisitsLog();
                
                // Calculate stats
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const todayVisits = visits.filter(v => new Date(v.check_in_ts) >= today);
                
                const guestVisitCounts = visits.reduce((acc, v) => {
                    acc[v.guest_id] = (acc[v.guest_id] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                const returning = Object.values(guestVisitCounts).filter(count => count > 1).length;
                
                const hostCounts = todayVisits.reduce((acc, v) => {
                    acc[v.host] = (acc[v.host] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                const topHost = Object.keys(hostCounts).length > 0 ? Object.entries(hostCounts).sort((a, b) => b[1] - a[1])[0][0] : 'N/A';
                
                setStats({ today: todayVisits.length, returning, topHost });
                
                // Prepare chart data (visitors per day for the last 7 days)
                const last7DaysData: {[key: string]: number} = {};
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const key = d.toLocaleDateString('en-US', { weekday: 'short' });
                    last7DaysData[key] = 0;
                }

                visits.forEach(v => {
                    const visitDate = new Date(v.check_in_ts);
                    const todayDate = new Date();
                    const diffDays = Math.ceil((todayDate.getTime() - visitDate.getTime()) / (1000 * 3600 * 24));
                    if (diffDays <= 7) {
                       const key = visitDate.toLocaleDateString('en-US', { weekday: 'short' });
                       if(last7DaysData.hasOwnProperty(key)) {
                          last7DaysData[key]++;
                       }
                    }
                });
                
                setChartData(Object.keys(last7DaysData).map(name => ({ name, visitors: last7DaysData[name] })));
                
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <SpinnerIcon className="w-8 h-8 text-primary" />
                <span className="ml-2 text-slate-600">Loading dashboard...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 font-medium">Total Visitors Today</h3>
                    <p className="text-3xl font-bold text-primary mt-2">{stats.today}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 font-medium">Returning Visitors</h3>
                    <p className="text-3xl font-bold text-primary mt-2">{stats.returning}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 font-medium">Top Host Today</h3>
                    <p className="text-3xl font-bold text-primary mt-2">{stats.topHost}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Weekly Visitor Trend</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                      <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="visitors" fill="#007BFF" />
                      </BarChart>
                  </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
