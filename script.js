//Section 2 canvas:
async function fetchData(endpoint, canvasId, chartLabel, backgroundColor, borderColor) {
    try {
        const response = await fetch(`http://localhost:3000/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Transform data into labels and datasets for Chart.js
        const labels = data.map(item => item._id.yearquarter || item._id);
        const counts = data.map(item => item.count);

        // Get the context of the canvas element we want to select
        const ctx = document.getElementById(canvasId).getContext('2d');

        // Create the chart
        new Chart(ctx, {
            type: 'bar', // Change this to 'line', 'pie', etc., if needed
            data: {
                labels: labels,
                datasets: [{
                    label: chartLabel,
                    data: counts,
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch data and create the chart on page load
fetchData('postcount/yearquarter', 'postCountChartWorld', 'Posts by Year-Quarter (World)', 'rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 1)');
fetchData('postcount/denmark/yearquarter', 'postCountChartDenmark', 'Posts by Year-Quarter (Denmark)', 'rgba(192, 75, 75, 0.2)', 'rgba(192, 75, 75, 1)');


async function fetchCategoryData(endpoint, canvasId, chartLabel) {
    try {
        const response = await fetch(`http://localhost:3000/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Transform data into labels and datasets for Chart.js
        const labels = [...new Set(data.map(item => item._id.yearquarter))];
        const categories = [...new Set(data.map(item => item._id.category))];

        const categoryColors = {
            'Political': 'rgba(255, 99, 132, 0.2)',
            'Media': 'rgba(54, 162, 235, 0.2)',
            'Societal': 'rgba(75, 192, 192, 0.2)',
        };

        const categoryBorderColors = {
            'Political': 'rgba(255, 99, 132, 1)',
            'Media': 'rgba(54, 162, 235, 1)',
            'Societal': 'rgba(75, 192, 192, 1)',
        };

        const datasets = categories.map(category => {
            return {
                label: category,
                data: labels.map(label => {
                    const item = data.find(d => d._id.yearquarter === label && d._id.category === category);
                    return item ? item.count : 0;
                }),
                backgroundColor: categoryColors[category] || 'rgba(128, 32, 143, 0.2)',  // Default color if category not defined
                borderColor: categoryBorderColors[category] || 'rgba(128, 32, 143, 1)',  // Default border color
                borderWidth: 1
            };
        });

        // Get the context of the canvas element we want to select
        const ctx = document.getElementById(canvasId).getContext('2d');

        // Create the chart
        new Chart(ctx, {
            type: 'bar', // Change this to 'line', 'pie', etc., if needed
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    },
                    x: {
                        stacked: false
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch data and create the chart on page load
fetchCategoryData('postcount/world/yearquarter/category', 'categoryCountChartWorld', 'Posts by Year-Quarter (World)');


async function fetchCategoryData(endpoint, canvasId, chartLabel) {
    try {
        const response = await fetch(`http://localhost:3000/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Transform data into labels and datasets for Chart.js
        const labels = [...new Set(data.map(item => item._id.yearquarter))];
        const categories = [...new Set(data.map(item => item._id.category))];

        const categoryColors = {
            'Political': 'rgba(255, 99, 132, 0.2)',
            'Media': 'rgba(54, 162, 235, 0.2)',
            'Societal': 'rgba(75, 192, 192, 0.2)',
        };

        const categoryBorderColors = {
            'Political': 'rgba(255, 99, 132, 1)',
            'Media': 'rgba(54, 162, 235, 1)',
            'Societal': 'rgba(75, 192, 192, 1)',
        };

        const datasets = categories.map(category => {
            return {
                label: category,
                data: labels.map(label => {
                    const item = data.find(d => d._id.yearquarter === label && d._id.category === category);
                    return item ? item.count : 0;
                }),
                backgroundColor: categoryColors[category] || 'rgba(128, 32, 143, 0.2)',  // Default color if category not defined
                borderColor: categoryBorderColors[category] || 'rgba(128, 32, 143, 1)',  // Default border color
                borderWidth: 1
            };
        });

        // Get the context of the canvas element we want to select
        const ctx = document.getElementById(canvasId).getContext('2d');

        // Create the chart
        new Chart(ctx, {
            type: 'bar', // Change this to 'line', 'pie', etc., if needed
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    },
                    x: {
                        stacked: false
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch data and create the chart on page load
fetchCategoryData('postcount/denmark/yearquarter/category', 'categoryCountChartDenmark', 'Posts by Year-Quarter (Denmark)');

// Function to fetch data and create the chart
async function fetchForImodData(endpoint, canvasId, chartLabel, chartTitle) {
    try {
        const response = await fetch(`http://localhost:3000/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Transform data into labels and datasets for Chart.js
        const labels = data.map(item => item._id); // Assuming _id contains the values of gpt_ukraine_for_imod
        const counts = data.map(item => item.count);

        // Define colors for the pie chart
        const backgroundColors = [
            'rgba(123, 104, 238, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)'
        ];

        const borderColors = [
            'rgba(123, 104, 238, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
        ];

        // Get the context of the canvas element we want to select
        const ctx = document.getElementById(canvasId).getContext('2d');

        // Create the chart
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: chartLabel,
                    data: counts,
                    backgroundColor: backgroundColors.slice(0, counts.length),
                    borderColor: borderColors.slice(0, counts.length),
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: chartTitle
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch data and create the chart on page load
fetchForImodData('postcount/forimod/2024q1', 'countforimoddenmark2024q1', 'Count for Imod (Denmark, 2024Q1)', 'Support count for Denmark (2024Q1)');
fetchForImodData('postcount/forimod/2022q2', 'countforimoddenmark2022q2', 'Count for Imod (Denmark, 2022Q2)', 'Support count for Denmark (2022Q2)');

