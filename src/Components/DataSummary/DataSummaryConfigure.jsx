import { AutoComplete, Form, Input } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { MdCancel } from "react-icons/md"
import { v4 as uuid } from "uuid"
import { GET_EXCHANGE_API, GET_FILTERS_API } from '../../API/ApiServices'
import style from './DataSummary.module.scss'

function DataSummaryConfigure({ shareParityData, parityDetails, toggleShowOptions }) {
    const [list, setList] = useState({
        exchangelist: [],
        symbolList1: [],
        symbolList2: []
    })
    console.log({ parityDetails });
    const [parityData, setParityData] = useState({
        parityname: "",
        leg1: {

            exchange: "",
            symbol: ""
        },
        leg2: {

            exchange: "",
            symbol: ""
        }
    })





    useEffect(() => {
        const exchangelist = new Promise((resolve, reject) => {
            resolve(GET_EXCHANGE_API())
        })
        exchangelist.then(res => {
            console.log({ res });
            setList(prev => ({ ...prev, exchangelist: res.data.result }))
        }).catch(err => {
            console.log({ err });
        })
    }, [])

    const fetchSymbol = useCallback((symbolKey, value) => {
        const symbollist = new Promise((resolve, reject) => {
            resolve(GET_FILTERS_API({
                event: "getselectedfilters",
                data: {
                    filters: {
                        exchange: [value],
                    },
                },
            }))
        })
        symbollist.then(res => {
            console.log({ res });
            setList(prev => ({ ...prev, [symbolKey]: res.data.result.symbols }))
        }).catch(err => {
            console.log({ err });
        })
    }, [])

    const handleSelect = (leg, key, value) => {
        setParityData(prev => ({
            ...prev,
            [leg]: {
                ...prev[leg],
                [key]: value
            }

        }))

    }

    const createParity = () => {
        // const data = { parityname: parityData.parityname, leg1: { parityData.} }
        shareParityData(p => [...p, { ...parityData, id: uuid() }])
        toggleShowOptions()
    }

    const deleteparity = (obj) => {
        shareParityData(prevParity => prevParity.filter(parity => {
            return parity.id !== obj.id
        }))

    }
    return (
        <>
            <Form
                labelCol={{ span: 4 }}
                className={style.paritySection}
            >
                <Form.Item label="Pair Name:" className={style.paritynamesection}>
                    <Input
                        name={"parityname"}
                        value={parityData.parityname}
                        onChange={(e) => setParityData(prev => ({ ...prev, parityname: e.target.value }))}
                    // required
                    />
                </Form.Item>
                <Form.Item label="Leg 1: " className={style.legSection}>
                    {/* <Select
                    placeholder={"Select Exchange"}
                    required
                    name="exchange"
                    // defaultValue={strategyData.data.strategysegment}
                    onSelect={(value, options) => {
                        handleSelect('leg1', 'exchange', value)
                        fetchSymbol('symbolList1', value)
                    }}
                    options={list.exchangelist.map(e => { return { label: e.exchange, value: e.exchange } })}
                    className={`me-2 ${style.selectionList}`}
                /> */}
                    <AutoComplete
                        allowClear
                        notFoundContent="Exchange Does Not Exist"
                        defaultActiveFirstOption
                        value={parityData.leg1.exchange}
                        onChange={(e) => setParityData(prev => ({ ...prev, leg1: { ...prev.leg1, exchange: e } }))}
                        onSelect={(value, options) => {
                            handleSelect('leg1', 'exchange', value)
                            fetchSymbol('symbolList1', value)
                        }}
                        onClear={(e) => {
                            setParityData(prev => ({ ...prev, leg1: { ...prev.leg1, exchange: "" } }))
                        }}
                        options={list.exchangelist.map(e => { return { value: e.exchange } })}
                        placeholder="Select an Exchange"
                        filterOption={(inputValue, option) =>
                            option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                        }
                        className={`me-2 ${style.selectionList}`}
                    />
                    <AutoComplete
                        allowClear
                        notFoundContent="Symbol Does Not Exist"
                        defaultActiveFirstOption
                        value={parityData.leg1.symbol}
                        onChange={(e) => setParityData(prev => ({ ...prev, leg1: { ...prev.leg1, symbol: e } }))}
                        onSelect={(value) => {
                            handleSelect('leg1', 'symbol', value)

                        }}
                        onClear={(e) => {
                            setParityData(prev => ({ ...prev, leg1: { ...prev.leg1, symbol: "" } }))
                        }}
                        options={list.symbolList1.map(e => { return { value: e } })}
                        placeholder="Select a Symbol"
                        filterOption={(inputValue, option) =>
                            option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                        }
                        className={style.selectionList}
                    />

                    {/* <Select
                    placeholder={"Select Symbol"}
                    required
                    name="symbol"
                    // defaultValue={strategyData.data.strategysegment}
                    onSelect={(value) => {
                        handleSelect('leg1', 'symbol', value)
                    }}
                    options={list.symbolList1.map(e => { return { label: e, value: e } })}
                    className={style.selectionList}
                /> */}
                </Form.Item>
                <Form.Item label="Leg 2: " className={style.legSection}>
                    {/* <Select
                    placeholder={"Select Exchange"}
                    required
                    name="exchange"
                    // defaultValue={strategyData.data.strategysegment}
                    onSelect={(value, options) => {
                        handleSelect('leg2', 'exchange', value)
                        fetchSymbol('symbolList2', value)
                    }}
                    options={list.exchangelist.map(e => { return { label: e.exchange, value: e.exchange } })}
                    className={`me-2 ${style.selectionList}`}
                /> */}
                    <AutoComplete
                        allowClear
                        notFoundContent="Exchange Does Not Exist"
                        defaultActiveFirstOption
                        value={parityData.leg2.exchange}
                        onChange={(e) => setParityData(prev => ({ ...prev, leg2: { ...prev.leg2, exchange: e } }))}
                        onSelect={(value, options) => {
                            handleSelect('leg2', 'exchange', value)
                            fetchSymbol('symbolList2', value)
                        }}
                        onClear={(e) => {
                            setParityData(prev => ({ ...prev, leg2: { ...prev.leg2, exchange: "" } }))
                        }}
                        options={list.exchangelist.map(e => { return { value: e.exchange } })}
                        placeholder="Select an Exchange"
                        filterOption={(inputValue, option) =>
                            option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                        }
                        className={`me-2 ${style.selectionList}`}
                    />

                    <AutoComplete
                        allowClear
                        notFoundContent="Symbol Does Not Exist"
                        defaultActiveFirstOption
                        value={parityData.leg2.symbol}
                        onChange={(e) => setParityData(prev => ({ ...prev, leg2: { ...prev.leg2, symbol: e } }))}
                        onSelect={(value) => {
                            handleSelect('leg2', 'symbol', value)

                        }}
                        onClear={(e) => {
                            setParityData(prev => ({ ...prev, leg2: { ...prev.leg2, symbol: "" } }))
                        }}
                        options={list.symbolList2.map(e => { return { value: e } })}
                        placeholder="Select a Symbol"
                        filterOption={(inputValue, option) =>
                            option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                        }
                        className={style.selectionList}
                    />
                    {/* <Select
                    placeholder={"Select Symbol"}
                    required
                    name="symbol"
                    // defaultValue={strategyData.data.strategysegment}
                    onSelect={(value) => {
                        handleSelect('leg2', 'symbol', value)

                    }}
                    options={list.symbolList2.map(e => { return { label: e, value: e } })}
                    className={style.selectionList}
                /> */}
                </Form.Item>
                <Form.Item className={style.createBtn}>
                    <Button onClick={createParity}>Create</Button>
                </Form.Item>

            </Form >
            <div className={style.deleteParity}>
                {
                    parityDetails.map(obj => {
                        return <span className={style.deleteWindow}>
                            <div className={style.parityName}>{obj.parityname}</div>
                            <button onClick={() => deleteparity(obj)}><MdCancel /></button>

                        </span>

                    })
                }
            </div>
        </>
    )
}

export default DataSummaryConfigure