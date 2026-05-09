"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  BookOpen, 
  DoorOpen, 
  Users2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Upload, 
  Printer, 
  FileBarChart 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardCharts({ data, workload }: any) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Weekly Distribution */}
      <Card className="rounded-3xl shadow-xl shadow-slate-100 border-slate-100">
        <CardHeader>
          <CardTitle className="text-lg font-black text-slate-800">توزيع الحصص حسب اليوم</CardTitle>
          <CardDescription>إجمالي المحاضرات والأعمال الموجهة والتطبيقية خلال الأسبوع</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: "#64748b" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500, fill: "#64748b" }} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
              <Bar dataKey="lecture" name="محاضرة" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="td" name="أعمال موجهة" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tp" name="أعمال تطبيقية" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Professor Workload */}
      <Card className="rounded-3xl shadow-xl shadow-slate-100 border-slate-100">
        <CardHeader>
          <CardTitle className="text-lg font-black text-slate-800">عبء الأساتذة (أعلى 10)</CardTitle>
          <CardDescription>مقارنة الساعات الحالية بالحد الأقصى المسموح به</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workload} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 700, fill: "#334155" }}
                width={100}
              />
              <RechartsTooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="hours" name="الساعات الحالية" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                {workload.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.hours > entry.max ? "#ef4444" : "#3b82f6"} />
                ))}
              </Bar>
              {/* Reference Line for Max Hours */}
              <Bar dataKey="max" name="الحد الأقصى" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={5} opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
