import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChartComponent } from './ChartComponent';

// Mock data for chart
const mockData = [
  { timestamp: 1620000000000, price: 50000 },
  { timestamp: 1620003600000, price: 50500 },
];

describe('ChartComponent', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ChartComponent
        data={mockData}
        color="blue"
        height={200}
        title="Test Chart"
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders the title', () => {
    const { getByText } = render(
      <ChartComponent
        data={mockData}
        color="blue"
        height={200}
        title="Test Chart"
      />
    );
    expect(getByText('Test Chart')).toBeInTheDocument();
  });

  it.skip('renders the chart SVG', async () => {
    // Skipped: recharts may not render SVG in the test environment
  });
}); 
