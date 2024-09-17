import { useState } from 'react'
import MultiSelectInput from './MultiSelectInput'

function Test() {
    const [data, setData] = useState([])


    const options = [
        { label: "Apple", value: "apple" },
        { label: "Banana", value: "banana" },
        { label: "Orange", value: "orange" },
        { label: "Grapes", value: "grapes" },
        { label: "Strawberry", value: "strawberry" },
        { label: "Watermelon", value: "watermelon" },
        { label: "Pineapple", value: "pineapple" },
        { label: "Mango", value: "mango" },
        { label: "Kiwi", value: "kiwi" },
        { label: "Peach", value: "peach" },
    ]


    console.log(data)
    return (
        <div style={{ margin: "2rem" }}>

            <MultiSelectInput maxOptionHeight={200} maxHeight={100} selectAllOption options={options} value={data} onChange={e => { console.log({ Changed: e }); setData(e) }} />
        </div >
    )
}

export default Test