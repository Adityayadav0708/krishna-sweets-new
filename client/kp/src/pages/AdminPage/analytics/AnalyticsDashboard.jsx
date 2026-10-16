import { useState, useEffect } from 'react';
import { SummaryCards } from './SummaryCards';
import { MonthlyRevenueChart } from './MonthlyRevenueChart';
import { DailySalesChart } from './DailySalesChart';
import { analyticsService } from '@/services/analyticsService';

export function AnalyticsDashboard() {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getSummary({});
      setSummaryData(data);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {/* Top Summary Cards — Revenue Milestones */}
      <SummaryCards data={summaryData} loading={loading} />

      {/* Primary Graphs Row: Monthly Income & Daily Sales */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <MonthlyRevenueChart />
        <DailySalesChart />
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
