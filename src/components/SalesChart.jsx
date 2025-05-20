import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SalesChart = ({ orders }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    if (!orders || orders.length === 0) return;

    // Calculate total revenue and orders
    const total = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    setTotalRevenue(total);
    setTotalOrders(orders.length);
    setAverageOrderValue(total / orders.length);

    // Process data for charts
    processChartData();
  }, [orders]);

  const processChartData = () => {
    if (!orders || orders.length === 0) return;

    // Group orders by month
    const ordersByMonth = {};
    const ordersByStatus = {
      'Pending': 0,
      'Paid': 0,
      'Delivered': 0
    };

    orders.forEach(order => {
      // Process for monthly data
      let date;
      if (order.createdAt) {
        date = new Date(order.createdAt);
      } else if (order.paidAt) {
        date = new Date(order.paidAt);
      } else {
        date = new Date(); // Fallback to current date
      }

      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!ordersByMonth[monthYear]) {
        ordersByMonth[monthYear] = {
          count: 0,
          revenue: 0
        };
      }
      
      ordersByMonth[monthYear].count += 1;
      ordersByMonth[monthYear].revenue += (order.totalPrice || 0);

      // Process for status data
      if (order.status) {
        ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
      }
    });

    // Sort months chronologically
    const sortedMonths = Object.keys(ordersByMonth).sort((a, b) => {
      const [aMonth, aYear] = a.split('/').map(Number);
      const [bMonth, bYear] = b.split('/').map(Number);
      
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    });

    // Prepare data for charts
    const monthlyData = {
      labels: sortedMonths,
      datasets: [
        {
          label: 'Monthly Revenue ($)',
          data: sortedMonths.map(month => {
            const revenue = ordersByMonth[month].revenue;
            return typeof revenue === 'number' ? revenue.toFixed(2) : 0;
          }),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Order Count',
          data: sortedMonths.map(month => ordersByMonth[month].count),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        }
      ]
    };

    setChartData(monthlyData);
  };

  const toggleChartType = (type) => {
    setChartType(type);
  };

  const renderChart = () => {
    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Sales Performance',
          font: {
            size: 16
          }
        },
      },
    };

    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
        // For pie chart, we'll show order status distribution
        const statusData = {
          labels: ['Pending', 'Paid', 'Delivered'],
          datasets: [
            {
              data: [
                orders.filter(o => o.status === 'Pending').length,
                orders.filter(o => o.status === 'Paid').length,
                orders.filter(o => o.status === 'Delivered').length
              ],
              backgroundColor: [
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)'
              ],
              borderColor: [
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
              ],
              borderWidth: 1,
            },
          ],
        };
        return <Pie data={statusData} options={options} />;
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Sales Dashboard</h5>
        <div className="btn-group">
          <button 
            className={`btn btn-sm ${chartType === 'bar' ? 'btn-light' : 'btn-outline-light'}`}
            onClick={() => toggleChartType('bar')}
          >
            Bar
          </button>
          <button 
            className={`btn btn-sm ${chartType === 'line' ? 'btn-light' : 'btn-outline-light'}`}
            onClick={() => toggleChartType('line')}
          >
            Line
          </button>
          <button 
            className={`btn btn-sm ${chartType === 'pie' ? 'btn-light' : 'btn-outline-light'}`}
            onClick={() => toggleChartType('pie')}
          >
            Pie
          </button>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card bg-info text-white">
              <div className="card-body text-center">
                <h5 className="card-title">Total Revenue</h5>
                <h3>${typeof totalRevenue === 'number' ? totalRevenue.toFixed(2) : '0.00'}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-success text-white">
              <div className="card-body text-center">
                <h5 className="card-title">Total Orders</h5>
                <h3>{totalOrders}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-warning text-white">
              <div className="card-body text-center">
                <h5 className="card-title">Avg. Order Value</h5>
                <h3>${typeof averageOrderValue === 'number' && !isNaN(averageOrderValue) ? averageOrderValue.toFixed(2) : '0.00'}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="chart-container" style={{ height: '400px' }}>
          {orders && orders.length > 0 ? (
            renderChart()
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No order data available</p>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default SalesChart;
