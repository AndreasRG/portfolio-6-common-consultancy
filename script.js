
//First visualisation:

// Get the context of the canvas element we want to select
async function fetchData() {
    try {
        // Fetch data from both endpoints
        const response1 = await fetch('http://localhost:3000/postcount/yearquarter');
        const response2 = await fetch('http://localhost:3000/postcount/denmark/yearquarter');

        if (!response1.ok || !response2.ok) {
            throw new Error(`HTTP error! Status: ${response1.status}, ${response2.status}`);
        }

        const data1 = await response1.json();
        const data2 = await response2.json();

        // Transform data into labels and datasets for Chart.js
        const labels = [...new Set([...data1.map(item => item._id), ...data2.map(item => item._id)])].sort();

        const counts1 = labels.map(label => {
            const item = data1.find(d => d._id === label);
            return item ? item.count : 0;
        });

        const counts2 = labels.map(label => {
            const item = data2.find(d => d._id === label);
            return item ? item.count : 0;
        });

        // Get the context of the canvas element we want to select
        const ctx = document.getElementById('postCountChart').getContext('2d');

        // Create the chart
        new Chart(ctx, {
            type: 'bar', // Change this to 'line', 'pie', etc., if needed
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Posts by Year-Quarter (All)',
                        data: counts1,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Posts by Year-Quarter (Denmark)',
                        data: counts2,
                        backgroundColor: 'rgba(192, 75, 75, 0.2)',
                        borderColor: 'rgba(192, 75, 75, 1)',
                        borderWidth: 1
                    }
                ]
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
