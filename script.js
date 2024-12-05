
//First visualisation:

// Get the context of the canvas element we want to select
async function fetchData() {
    try {
        const response = await fetch('http://localhost:3000/postcount/yearquarter');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Transform data into labels and datasets for Chart.js
        const labels = data.map(item => item._id);
        const counts = data.map(item => item.count);

        // Get the context of the canvas element we want to select
        const ctx = document.getElementById('postCountChart').getContext('2d');

        // Create the chart
        new Chart(ctx, {
            type: 'bar', // Change this to 'line', 'pie', etc., if needed
            data: {
                labels: labels,
                datasets: [{
                    label: 'Posts by Year-Quarter',
                    data: counts,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
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
fetchData();


