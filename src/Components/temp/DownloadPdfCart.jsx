import { useRef } from 'react';
import jsPDF from 'jspdf';
import Chart from 'chart.js/auto';

const PdfWithChart = () => {
    const options = {
        responsive: false,

        plugins: {
            legend: {},
            title: {
                display: true,
                text: 'Chart.js Line Chart',
            },
        },
    };
    const chartRef = useRef(null);

    const generatePDF = () => {
        // Create a new jsPDF instance
        const pdf = new jsPDF();

        // Get the canvas element of the chart
        const chartCanvas = chartRef.current;

        // Get the base64 image data from the chart
        const imageData = chartCanvas.toDataURL('image/png');
        console.log("imageData", imageData);
        // Add the image to the PDF
        pdf.addImage(imageData, 'PNG', 10, 10, 100, 50); // Adjust the parameters as needed

        // Save or open the PDF
        pdf.save('chart.pdf');
    };

    const initializeChart = () => {
        const ctx = chartRef.current.getContext('2d');

        new Chart(ctx, {
            type: 'bar', // Change the chart type as needed
            data: {
                labels: ['Label 1', 'Label 2', 'Label 3'],
                datasets: [
                    {
                        label: 'Dataset Label',
                        data: [10, 20, 30], // Example data
                        backgroundColor: ['red', 'green', 'blue'], // Example colors
                    },
                ],
            },
            options
        });
    };

    return (
        <div>
            <div style={{ display: 'none' }}>
                <canvas ref={chartRef} width={300} height={150} ></canvas>
            </div>
            <button onClick={generatePDF}>Generate PDF</button>
            <button onClick={initializeChart}>Initialize Chart</button>
        </div>
    );
};

export default PdfWithChart;
