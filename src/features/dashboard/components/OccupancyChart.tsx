import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OccupancySlice } from '../services/landlordDashboardService';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted-foreground))'];

interface OccupancyChartProps {
  data: OccupancySlice[];
  occupancyRate: number;
}

export function OccupancyChart({ data, occupancyRate }: OccupancyChartProps) {
  const hasData = data.some((d) => d.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h6">Occupancy</CardTitle>
      </CardHeader>
      <CardContent className="flex h-72 flex-col items-center justify-center">
        {hasData ? (
          <>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                />
                <Legend wrapperStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-h5 font-semibold tabular-nums text-foreground">
              {occupancyRate}% occupied
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">No units yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
