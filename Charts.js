import React from 'react';
import { Box } from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

// 5-Year Order History
export function FiveYearChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="0" stroke="#e4e8ef" />
        <XAxis dataKey="fy" tick={{ fill: '#8892a4', fontSize: 11 }} />
        <YAxis yAxisId="left" tick={{ fill: '#8892a4', fontSize: 11 }} />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: '#7c3aed', fontSize: 11 }}
        />
        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e8ef' }} />
        <Bar
          yAxisId="left"
          dataKey="orders"
          fill="#2563eb"
          radius={[4, 4, 0, 0]}
          name="Orders (count)"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="value"
          stroke="#7c3aed"
          strokeWidth={2}
          dot={{ fill: '#7c3aed', r: 4 }}
          name="Value (Cr)"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Lead Outcomes Pie Chart
export function LeadOutcomesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={0}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}%`} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * Monthly Trend Line Chart
 *
 * Props:
 *   data      – array of { month, [thisFY]: count, [prevFY]: count }
 *   thisFY    – string label for the current FY, e.g. "FY 25-26"
 *   prevFY    – string label for the previous FY, e.g. "FY 24-25"
 *
 * Both FY props are optional and fall back to the old hardcoded values
 * so existing usages that don't pass them continue to work.
 */
export function MonthlyTrendChart({ data, thisFY = 'FY 25-26', prevFY = 'FY 24-25' }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="0" stroke="#e4e8ef" />
        <XAxis dataKey="month" tick={{ fill: '#8892a4', fontSize: 11 }} />
        <YAxis tick={{ fill: '#8892a4', fontSize: 11 }} />
        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e8ef' }} />
        <Legend />
        <Line
          type="monotone"
          dataKey={thisFY}
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 3 }}
          fill="rgba(37,99,235,0.08)"
        />
        <Line
          type="monotone"
          dataKey={prevFY}
          stroke="#d1d5db"
          strokeDasharray="4 3"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Civil vs Defence Bar Chart
export function CivilDefenceChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="0" stroke="#e4e8ef" />
        <XAxis dataKey="category" tick={{ fill: '#8892a4', fontSize: 11 }} />
        <YAxis tick={{ fill: '#8892a4', fontSize: 11 }} />
        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e8ef' }} />
        <Legend />
        <Bar dataKey="Civil" fill="#2563eb" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Defence" fill="#7c3aed" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Lead Sub-Types Pie Chart
export function LeadSubTypesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={70}
          paddingAngle={0}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => value} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Domain Win/Loss Chart
export function DomainWinLossChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="0" stroke="#e4e8ef" />
        <XAxis dataKey="domain" tick={{ fill: '#8892a4', fontSize: 11 }} />
        <YAxis tick={{ fill: '#8892a4', fontSize: 11 }} />
        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e8ef' }} />
        <Legend />
        <Bar dataKey="Won" fill="#16a34a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Lost" fill="#dc2626" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Top 10 Customers Horizontal Bar Chart
export function Top10Chart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="0" stroke="#e4e8ef" />
        <XAxis type="number" tick={{ fill: '#8892a4', fontSize: 11 }} />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fill: '#8892a4', fontSize: 11 }}
          width={100}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e8ef' }}
          formatter={(value) => `₹${value}Cr`}
        />
        <Bar dataKey="value" fill="rgba(37,99,235,0.15)" stroke="#2563eb" strokeWidth={1.5} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// BQ Conversion Funnel
export function ConversionFunnelChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="0" stroke="#e4e8ef" />
        <XAxis dataKey="stage" tick={{ fill: '#8892a4', fontSize: 11 }} />
        <YAxis tick={{ fill: '#8892a4', fontSize: 11 }} />
        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e8ef' }} />
        <Bar
          dataKey="count"
          fill="#2563eb"
          radius={[6, 6, 0, 0]}
          shape={<CustomFunnelBar />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function CustomFunnelBar(props) {
  return <rect {...props} />;
}

/**
 * Quarterly Comparison Chart
 *
 * Props:
 *   data   – array of { quarter, [thisFY]: count, [prevFY]: count }
 *   thisFY – string label for the current FY  (default "FY 25-26")
 *   prevFY – string label for the previous FY (default "FY 24-25")
 */
export function QuarterlyChart({ data, thisFY = 'FY 25-26', prevFY = 'FY 24-25' }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="0" stroke="#e4e8ef" />
        <XAxis dataKey="quarter" tick={{ fill: '#8892a4', fontSize: 11 }} />
        <YAxis tick={{ fill: '#8892a4', fontSize: 11 }} />
        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e8ef' }} />
        <Legend />
        <Bar dataKey={thisFY} fill="#2563eb" radius={[4, 4, 0, 0]} />
        <Bar dataKey={prevFY} fill="rgba(37,99,235,0.25)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Tender Type Pie Chart
export function TenderTypeChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={35}
          outerRadius={65}
          paddingAngle={0}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => value} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Lead Owner Performance Chart
export function OwnerPerformanceChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="0" stroke="#e4e8ef" />
        <XAxis
          type="number"
          tick={{ fill: '#8892a4', fontSize: 11 }}
          tickFormatter={(value) => `₹${value}Cr`}
        />
        <YAxis
          dataKey="owner"
          type="category"
          tick={{ fill: '#8892a4', fontSize: 11 }}
          width={80}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e8ef' }}
          formatter={(value) => `₹${value}Cr`}
        />
        <Bar
          dataKey="value"
          fill="rgba(13,148,136,0.15)"
          stroke="#0d9488"
          strokeWidth={1.5}
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Pipeline Status Chart
export function PipelineStatusChart({ data }) {
  const colors = ['#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a'];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="0" stroke="#e4e8ef" />
        <XAxis dataKey="stage" tick={{ fill: '#8892a4', fontSize: 11 }} />
        <YAxis tick={{ fill: '#8892a4', fontSize: 11 }} />
        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e8ef' }} />
        <Bar dataKey="count" fill="#3b82f6" radius={[5, 5, 0, 0]} shape={<CustomBar colors={colors} />} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function CustomBar({ colors, ...props }) {
  return <rect {...props} />;
}

// Pipeline Domain Chart
export function PipelineDomainChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="0" stroke="#e4e8ef" />
        <XAxis dataKey="domain" tick={{ fill: '#8892a4', fontSize: 11 }} />
        <YAxis
          tick={{ fill: '#8892a4', fontSize: 11 }}
          tickFormatter={(value) => `₹${value}Cr`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e8ef' }}
          formatter={(value) => `₹${value}Cr`}
        />
        <Legend />
        <Bar dataKey="Civil" fill="#2563eb" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Defence" fill="#7c3aed" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Value Distribution Chart
export function ValueDistributionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="0" stroke="#e4e8ef" />
        <XAxis dataKey="band" tick={{ fill: '#8892a4', fontSize: 11 }} />
        <YAxis tick={{ fill: '#8892a4', fontSize: 11 }} />
        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e8ef' }} />
        <Bar
          dataKey="count"
          fill="rgba(124,58,237,0.15)"
          stroke="#7c3aed"
          strokeWidth={1.5}
          radius={[5, 5, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Yearly Value Chart
export function YearlyValueChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="0" stroke="#e4e8ef" />
        <XAxis dataKey="fy" tick={{ fill: '#8892a4', fontSize: 11 }} />
        <YAxis
          tick={{ fill: '#8892a4', fontSize: 11 }}
          tickFormatter={(value) => `₹${value}Cr`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e8ef' }}
          formatter={(value) => `₹${value}Cr`}
        />
        <Bar
          dataKey="value"
          fill="#2563eb"
          radius={[6, 6, 0, 0]}
          shape={<YearlyBarShape />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function YearlyBarShape(props) {
  return <rect {...props} />;
}

// Win Rate Trend Chart
export function WinRateTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="0" stroke="#e4e8ef" />
        <XAxis dataKey="fy" tick={{ fill: '#8892a4', fontSize: 11 }} />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: '#8892a4', fontSize: 11 }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e8ef' }}
          formatter={(value) => `${value}%`}
        />
        <Line
          type="monotone"
          dataKey="rate"
          stroke="#16a34a"
          strokeWidth={2}
          dot={{ fill: '#16a34a', r: 5, borderWidth: 2, borderColor: '#ffffff' }}
          fill="rgba(22,163,74,0.08)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Stacked Activity Chart
export function ActivityChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="0" stroke="#e4e8ef" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#8892a4', fontSize: 9 }}
          interval={2}
        />
        <YAxis tick={{ fill: '#8892a4', fontSize: 11 }} />
        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e8ef' }} />
        <Legend />
        <Bar dataKey="BQ" stackId="a" fill="rgba(37,99,235,0.7)" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Leads" stackId="a" fill="rgba(13,148,136,0.7)" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Orders" stackId="a" fill="rgba(124,58,237,0.7)" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Module Usage Pie Chart
export function ModuleUsageChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={75}
          paddingAngle={0}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => value} />
      </PieChart>
    </ResponsiveContainer>
  );
}
