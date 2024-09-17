import React, { useEffect, useState } from 'react'
import { Bar } from "react-chartjs-2";




const deafultdataSet = {
    labels: ["AG", "AGg"],
    datasets: [
        {
            label: "Hello",
            data: [34, 34],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }
    ],


};

const groupAndSumByUserId = (data, wise,) => {
    return data.reduce((result, row) => {
        const id = row[wise];
        result[id] = result[id] || { label: id, weeklynetmtm: 0 };
        result[id].weeklynetmtm += parseFloat(row.weeklynetmtm);
        return result;
    }, {});
}


function TableChart({ data, title, wise }) {
    const [dataset, setDataset] = useState([])
    const options = {
        animations: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { barPercentage: 0.5 },
            y: {
                ticks: {
                    beginAtZero: true,
                },
            },
        },
        plugins: {
            datalabels: {
                display: false, // Set display to false to hide labels
            },
        },
        layout: {
            padding: {
                left: 50,
                right: 50, // Corrected property name
            },
        },
        // onComplete: () => {
        //     setIsRendered(true);
        //     console.log("Chart Renderedddddddddddddddddddddd");
        // },
        hover: {
            mode: null,
        },
        interaction: {
            mode: 'nearest',
        },
        plugins: {
            datalabels: {
                display: false,
                // Additional datalabels options
            },
        },
    };

    useEffect(() => {
        const newDataSet = []

        Object.keys(data).map(Currencty => {
            const labels = []
            const datas = []

            Object.values(groupAndSumByUserId(data[Currencty], wise)).forEach(e => {
                labels.push(e.label)
                datas.push(e.weeklynetmtm)
            })

            newDataSet.push({
                labels: labels,
                datasets: [
                    {
                        label: `${title} ${Currencty}`,
                        data: datas,
                        backgroundColor: datas.map(e => e > 0 ? "#06BE71" : "rgb(255, 0, 0)"),
                    }
                ]
            })

        })

        setDataset(newDataSet)
        console.log({ newDataSet })

    }, [data])

    // useEffect(() => {
    // }, [dataset])

    return (
        <div style={{ position: "fixed", width: "100vw", overflow: "hidden", height: "0px" }}  >
            {dataset.map((e, i) => {
                return <Bar style={{ background: "white" }} id={`${Object.keys(data)[i]}-Graph`} data={e} options={options} />
            })}
        </div>
    )
}

export default React.memo(TableChart)