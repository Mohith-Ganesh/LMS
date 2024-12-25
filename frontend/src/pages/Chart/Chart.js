// src/BooksChart.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import './Chart.css';  // Import the CSS file

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Chart = () => {
  const [chartData, setChartData] = useState({
    names: [],
    authors: [],
    genres: [],
    counts: []
  });

  useEffect(() => {
    // Fetch data from the backend
    axios.get('http://localhost:3000/book/chart') // Adjust the URL to match your backend
      .then(response => {
        const { names, authors, genres, counts } = response.data;
        setChartData({
          names,
          authors,
          genres,
          counts
        });
      })
      .catch(error => {
        console.error("There was an error fetching the data!", error);
      });
  }, []);

  // Bar chart data by author
  const barChartData = {
    labels: chartData.authors,
    datasets: [
      {
        label: 'Book Count by Author',
        data: chartData.counts,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Pie chart data by genre
  const pieChartData = {
    labels: chartData.genres,
    datasets: [
      {
        label: 'Book Count by Genre',
        data: chartData.counts,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  };

  // New Bar Chart data by Book Name and Count
  const nameCountBarChartData = {
    labels: chartData.names,  // Book names as labels
    datasets: [
      {
        label: 'Book Count by Name',
        data: chartData.counts,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  // New Pie Chart data by Book Name and Count
  const nameCountPieChartData = {
    labels: chartData.names,  // Book names as labels
    datasets: [
      {
        label: 'Book Count by Name',
        data: chartData.counts,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      },
    ],
  };

  return (
    <div className="chart-container">
      <div className='chart-container1'>
      <h2>Books Bar Chart (by Author)</h2>
      <Bar data={barChartData} options={{ responsive: true }} />

      <h2>Books Genre Pie Chart (by Genre)</h2>
      <Pie data={pieChartData} />
      </div>

      <div>
      <h2>Books Count Bar Chart (by Name)</h2>
      <Bar data={nameCountBarChartData} options={{ responsive: true }} />

      <h2>Books Count Pie Chart (by Name)</h2>
      <Pie data={nameCountPieChartData} />
      </div>
    </div>
  );
};

export default Chart;
