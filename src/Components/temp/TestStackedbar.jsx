import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    // Legend,
    // ChartDataLabels
);

function getRandomColor() {
    const colors = [
        "#5499C7",
        "#EB984E",
        "#58D68D",
        "#3498DB",
        "#0A454c",
        "#6D1679",
        "#D04C14",
        "#008EA8",
    ]; // Add more colors if needed
    return colors[Math.floor(Math.random() * colors.length)];
}



const options = {

    Animation: false,
    responsive: true,

    plugins: {
        datalabels: {
            anchor: "end",
            align: "start",
            offset: -22,
            formatter: (value, context) => {
                const datasetArray = []
                const positiveArray = []
                const negativeArray = []
                context.chart.data.datasets.forEach((dataset) => {

                    if (dataset.data[context.dataIndex] != undefined) {
                        datasetArray.push(dataset.data[context.dataIndex])
                        if (dataset.data[context.dataIndex] > 0) {
                            positiveArray.push(dataset.data[context.dataIndex])
                        }
                        else if (dataset.data[context.dataIndex] < 0) {
                            negativeArray.push(dataset.data[context.dataIndex])
                        }
                    }
                })

                function totalSum(total, datapoint) {
                    return total + datapoint;
                }

                let sum = datasetArray.reduce(totalSum, 0)

                if (context.datasetIndex == datasetArray.length - 1)
                    return Math.round(sum)
                else
                    return ''
            },
            font: {
                size: 14, // Set the desired font size
                weight: 'bold'
            },
            color: '#0d6efd', // Set the font color for the labels

        },

        legend: {
            display: false,
        },

    },
    scales: {
        x: {
            stacked: true,
            grid: {
                display: false,
                color: "rgba(10, 10,10, 10)",
            },
        },

        y: { stacked: true, },
    },
    maxBarThickness: 100,
    layout: {
        padding: {
            top: 15,
            bottom: 15
        }
    }
}


const data = {
    labels: [],
    datasets: [],
}


function TestStackedbar() {
    const positionChartData = useSelector(
        (state) => state?.positionChart
    );

    useEffect(() => {
        let total = 0;
        positionChartData.forEach(e => {
            if (e.exchange == "CME" && e.symbol == "NG") {
                total += e.cfqty
            }
        })
        console.log({ total })
    }, [positionChartData])

    const [finalData, setFinaldata] = useState(data)
    const [exchange, setExchange] = useState("CME");

    useEffect(() => {

        data.labels.splice(0, data.labels.length)
        data.datasets.splice(0, data.datasets.length)

        positionChartData.forEach((currPosition, index) => {
            if (currPosition.exchange == exchange) {
                let symbolInde = data.labels.indexOf(currPosition.symbol);
                if (symbolInde == -1) {
                    data.labels.push(currPosition.symbol)
                    symbolInde = data.labels.length - 1
                }

                const existedUser = data.datasets.findIndex(e => e.label === currPosition.userid)

                let newNo = currPosition?.cfqty
                if (existedUser !== -1) {
                    const currData = data.datasets[existedUser].data[symbolInde]
                    if (currData) newNo += currData

                    data.datasets[existedUser].data[symbolInde] = newNo

                } else {
                    const newRoww = {
                        label: currPosition.userid,
                        backgroundColor: getRandomColor(),
                        data: []
                    }
                    newRoww.data[symbolInde] = newNo
                    data.datasets.push(newRoww)
                }
            }
        })
        setFinaldata({ ...data })
    }, [positionChartData, exchange])

    return <Bar options={options} data={finalData} />;
}


export default TestStackedbar
