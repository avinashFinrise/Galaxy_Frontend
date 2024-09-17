import { Checkbox, Col, Row, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { GET_FILTERS_API, GET_GROUP_API } from '../../../API/ApiServices';

const order = ["exchange", "cluster", "group", "username"]

function NewReportForm({ data, wise, setData, exchangeOptions, toFilter }) {
    console.log({ data })
    const [options, setOptions] = useState({ exchange: [], group: [], username: [], cluster: [] })
    const [apiData, setapiData] = useState({
        alternateGroups: [],
        groupname: []
    })
    useEffect(() => {
        (async () => {
            try {
                const getapidata = await Promise.all([
                    GET_GROUP_API(),
                ])
                const [groupname] = getapidata;
                if (groupname) {
                    setapiData((previous) => ({
                        ...previous,
                        groupname: groupname.data.result
                    }));
                }

            } catch (err) {
                console.log(err)
            }
        })();
    }, [])
    const handleChange = async (value, name) => {
        setData(p => ({ ...p, [name]: value }))

        const toInclude = [...order].splice(0, order.indexOf(name) + 1)



        const filtersBody = {}

        toInclude.forEach(key => {
            filtersBody[key] = data[key]?.map(e => e.split("-")[1])
            if (key === name) {
                filtersBody[key] = value.map(e => e.split("-")[1])
            }
        })


        const res = await GET_FILTERS_API({
            "event": "downloadreportfilter", "data": {
                "filters": filtersBody
            }
        })
        const { group, userid, cluster } = res.data.result

        console.log({ toInclude }, filtersBody["group"], value.map(e => e.split("-")[0]));
        if (name == "group") {
            const res = await GET_FILTERS_API({
                "event": "getuseridfilter", "data": {
                    "filters": {
                        "groupname": value.map(e => e.split("-")[0])
                    }
                }
            })
            const userids = res.data.result[value[0].split("-")[0]]
            console.log({ userids });
        } else {
            setOptions({ group: group, username: userid, cluster: cluster })
        }

    }

    return (
        <div>
            <Form.Group className="col-12 mb-3">
                <Select
                    mode="multiple"
                    name="exchange"
                    allowClear
                    value={data.exchange}
                    style={{ width: "100%" }}
                    placeholder="Please select Exchange"
                    onChange={(selectedValues) =>
                        handleChange(selectedValues, "exchange")
                    }
                    options={exchangeOptions?.map((val) => {
                        return {
                            label: val.exchange,
                            value: `${val.exchange}-${val.id}`,
                        };
                    }).sort((a, b) =>
                        a.label.localeCompare(b.label)
                    )}
                    showSearch={true}
                    filterOption={(input, option) =>
                        option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    className="antdSelect"
                />
            </Form.Group>

            <Form.Group className="col-12 mb-3">
                <Select
                    mode="multiple"
                    allowClear
                    value={data.cluster}
                    style={{ width: "100%" }}
                    placeholder="Please select cluster"
                    onChange={(selectedValues) =>
                        handleChange(selectedValues, "cluster")
                    }
                    options={options?.cluster?.map((val) => {
                        return {
                            label: val.clustername,
                            value: `${val.clustername}-${val.Id}`,
                        };
                    })}
                    showSearch={true}
                    filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    className="antdSelect"
                />
            </Form.Group>

            {/* <Form.Group className="col-12 mb-3">
                <Select
                    mode="multiple"
                    allowClear
                    value={data.group}
                    style={{ width: "100%" }}
                    placeholder="Please select group"
                    onChange={(selectedValues) =>
                        handleChange(selectedValues, "group")
                    }
                    options={options?.group?.map((val) => {
                        return {
                            label: val.groupname,
                            value: `${val.groupname}-${val.Id}`,
                        };
                    })}
                    filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    className="antdSelect"
                />
            </Form.Group> */}
                    <Form.Group className="col-12 mb-3">
                        <Select
                            mode="multiple"
                            allowClear
                            value={data.group}
                            style={{ width: "100%" }}
                            placeholder="Please select  group"
                            onChange={(selectedValues) =>
                                handleChange(selectedValues, "group")
                            }
                            options={apiData.groupname?.map((val) => {
                                return {
                                    label: val.groupName,
                                    value: `${val.groupName}-${val.id}`,
                                };
                            })}
                            filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            className="antdSelect"
                        />
                    </Form.Group>

            {wise == "user" && <Form.Group className="col-12 mb-3">
                <Select
                    mode="multiple"
                    allowClear
                    value={data.username}
                    style={{ width: "100%" }}
                    placeholder="Please select User's"
                    onChange={(selectedValues) =>
                        handleChange(selectedValues, "username")
                    }
                    options={options?.username?.map((val) => {
                        return {
                            label: val.userId,
                            value: `${val.userId}-${val.Id}`,
                        };
                    })}
                    showSearch={true}
                    filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    className="antdSelect"
                />
            </Form.Group>}


            <Row>
                {toFilter.map(e => <Col xs={{
                    span: 6,
                    offset: 2,
                }}
                    lg={{
                        span: 6,
                        offset: 0,
                        flex: '20%',
                    }}> <Checkbox checked={data[e]} onChange={v => setData(p => ({ ...p, [e]: v.target.checked }))}>{e}</Checkbox> </Col>)}
            </Row>
        </div >
    )
}


export default NewReportForm
