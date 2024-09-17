import { AgGridReact } from 'ag-grid-react';
import { Form, Select, } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SlSettings } from "react-icons/sl";
import { TbMaximize } from "react-icons/tb";
import { shallowEqual, useSelector } from 'react-redux';
import { GET_COMPONENTSETTING_API, GET_HISTORICAL_DATASUMMARY_API, POST_COMPONENTSETTING_API } from '../../API/ApiServices';
import { formatValue, redGreenRowText } from '../../UtilityFunctions/grid';
import useGetMtmDataSummary from '../CustomHook/useGetMtmDataSummary';
import useGridSettings from '../CustomHook/useGridSettings';
import { ModalPopup } from '../DynamicComp';
import { Notification } from '../DynamicComp/Notification';
import style from './DataSummary.module.scss';
import DataSummaryConfigure from './DataSummaryConfigure';
import SaveBtn from './SaveBtn';

function OptType({ opttypeFilter, opttypefilterSelected, className }) {
    return (
        <Form className={className} >
            <Form.Item className=" " label="L1 Opttype">
                <Select
                    mode="multiple"
                    name="opttypel1"
                    allowClear
                    value={opttypeFilter.opttypel1}
                    style={{ width: "94%" }}
                    placeholder="opttype"
                    onChange={(selectedValues) =>
                        opttypefilterSelected(selectedValues, "opttypel1")
                    }
                    options={["ALL", "PE", "CE", "XX"]?.map((val) => {
                        return {
                            label: val,
                            value: val,
                        };
                    }).sort((a, b) =>
                        a.label.localeCompare(b.label)
                    )}
                    showSearch={true}
                    filterOption={(input, option) =>
                        option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    className={`antdSelect opttypeFilterSelct ${style.opttypeFilterSelct}`}
                />

            </Form.Item>
            <Form.Item className="" label="L2 Opttype">
                <Select
                    mode="multiple"
                    name="opttypel2"
                    allowClear
                    value={opttypeFilter.opttypel2}
                    style={{ width: "100%" }}
                    placeholder="opttype"
                    onChange={(selectedValues) =>
                        opttypefilterSelected(selectedValues, "opttypel2")
                    }
                    options={["ALL", "PE", "CE", "XX"]?.map((val) => {
                        return {
                            label: val,
                            value: val,
                        };
                    }).sort((a, b) =>
                        a.label.localeCompare(b.label)
                    )}
                    showSearch={true}
                    filterOption={(input, option) =>
                        option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    className={`antdSelect opttypeFilterSelct ${style.opttypeFilterSelct} `}
                />

            </Form.Item>
        </Form>
    )
}

const componentInfo = { componentname: "datasummary", componenttype: "table" }
const componentInfosaved = { componentname: "datasummarysaved", componenttype: "savedparity" }
function DataSummary() {
    const [NotifyData, setNotifyData] = useState({
        confirmFlag: false,
        confirmMsg: "confirm msg",
        successFlag: false,
        successMsg: "success msg",
        errorFlag: false,
        errorMsg: "error msg",
        loadingFlag: false,
        loadingMsg: "loading msg",
        activesession: false,
        headerMsg: "error ",
    });
    const [showOptions, setShowoptions] = useState(false)
    const [showDataSummary, setShowDataSummary] = useState(false)
    const [parityDetails, setParityDetails] = useState([])
    const [prevArbMtm, setPrevArbMtm] = useState({})
    const [gridData, setGridData] = useState([])
    const gridRef = useRef();
    const [savedDate, setSavedDate] = useState({})
    const [onReload, setOnReload] = useState(true)
    const [opttypeFilter, setOpttypeFilter] = useState({ opttypel1: ["ALL"], opttypel2: ["ALL"] })
    const CloseConfirm = () => {
        setNotifyData((data) => ({ ...data, confirmFlag: false }));
    };

    const CloseError = () => {
        setNotifyData((data) => ({ ...data, errorFlag: false }));
    };
    const CloseSuccess = () => {
        setNotifyData((data) => ({ ...data, successFlag: false }));
    };

    const onSave = (key, value) => {
        const final = {}
        const datesData = {}
        gridRef.current.api.forEachNode((val) => {
            if (val.field === "userid") {
                val.allLeafChildren.forEach(e => {
                    if (e.data[key] === value) {
                        final[e.id] = e.data.totalArbmtm
                        datesData[e.id] = new Date().toDateString()
                    }
                })
            }
        });
        setSavedDate(prev => ({ ...prev, ...datesData }))
        setPrevArbMtm(p => ({ ...p, ...final }))
    }


    const columnDef = useMemo(() => [
        // { field: 'parityname', rowGroup: true, hide: true },
        // { colId: 'cluster', field: 'clustername', rowGroup: true, hide: true },
        // { colId: 'groupname', field: 'groupname', rowGroup: true, hide: true },

        { colId: 'userid', field: 'userid', rowGroup: true, hide: true },
        // { colId: 'OPTTYPE', field: 'opttype', rowGroup: true, hide: true },
        {
            headerName: 'OPTTYPE',
            children: [
                { field: 'l1.opttype', hide: true, filter: true },
                { field: 'l2.opttype', hide: true, filter: true }
            ]
        },
        {
            headerName: 'CFQTY',
            children: [
                { field: 'l1.cfqty', filter: false, valueFormatter: formatValue, cellStyle: redGreenRowText },
                { field: 'l2.cfqty', filter: false, valueFormatter: formatValue, cellStyle: redGreenRowText }
            ]
        },
        {
            headerName: 'NETMTM',
            children: [
                { field: 'l1.netmtm', filter: false, valueFormatter: formatValue, cellStyle: redGreenRowText },
                { field: 'l2.netmtm', filter: false, valueFormatter: formatValue, cellStyle: redGreenRowText }
            ]
        },
        // {
        //     headerName: 'CECFQTY',
        //     children: [
        //         {
        //             field: 'l1.cecfqty',
        //             filter: false,
        //             valueFormatter: formatValue,
        //             cellStyle: redGreenRowText,
        //         },
        //         {
        //             field: 'l2.cecfqty',
        //             filter: false,
        //             valueFormatter: formatValue,
        //             cellStyle: redGreenRowText,
        //         }
        //     ]
        // },
        // {
        //     headerName: 'PECFQTY',
        //     children: [
        //         {
        //             field: 'l1.pecfqty',
        //             filter: false,
        //             valueFormatter: formatValue,
        //             cellStyle: redGreenRowText,
        //         },
        //         {
        //             field: 'l2.pecfqty',
        //             filter: false,
        //             valueFormatter: formatValue,
        //             cellStyle: redGreenRowText,
        //         }
        //     ]
        // },
        // {
        //     headerName: 'XXCFQTY',
        //     children: [
        //         {
        //             field: 'l1.xxcfqty',
        //             filter: false,
        //             valueFormatter: formatValue,
        //             cellStyle: redGreenRowText,
        //         },
        //         {
        //             field: 'l2.xxcfqty',
        //             filter: false,
        //             valueFormatter: formatValue,
        //             cellStyle: redGreenRowText,
        //         }
        //     ]
        // },
        {
            headerName: 'ARBNETMTM',
            children: [
                {
                    field: 'l1.arbnetmtm',
                    filter: false,
                    valueFormatter: formatValue,
                    cellStyle: redGreenRowText,
                },
                {
                    field: 'l2.arbnetmtm',
                    filter: false,
                    valueFormatter: formatValue,
                    cellStyle: redGreenRowText,
                }
            ]
        },
        { headerName: "Actions", field: "Actions", filter: false, cellRenderer: (e) => <SaveBtn onSave={onSave} grid={e} /> },


        {
            headerName: 'ARB MTM', field: 'totalArbmtm', filter: false, aggFun: 'sum', valueFormatter: formatValue, cellStyle: redGreenRowText,
        },
        { headerName: 'Saved ARB MTM', field: 'oldarbmtm', filter: false, aggFun: "sum", valueFormatter: formatValue, cellStyle: redGreenRowText },
        {
            headerName: 'DIFF', field: 'arbdiff', filter: false, aggFun: "sum",
            valueFormatter: formatValue,
            cellStyle: redGreenRowText,
        },
        {
            headerName: 'SAVED DATE', field: 'savedDate', filter: false,
            aggFunc: params => Array.from(new Set(params.values)).join(", "),
        },
    ], [gridRef])

    const update = (newData) => {
        if (!newData.data?.customId) return console.log("RETURNING")
        const pos = JSON.parse(JSON.stringify(newData.data));

        if (newData.isUpdate) gridRef.current.api.applyTransactionAsync({ update: [newData.data] });
        else gridRef.current.api.applyTransactionAsync({ add: [newData.data], });
    }


    const dateRange = useSelector((state) => state.dateRange, shallowEqual);
    const [isLive, setIsLive] = useState(true)

    const [positionData] = useGetMtmDataSummary(update, gridRef, [prevArbMtm, parityDetails, savedDate, isLive], isLive, onReload)
    // const positionData = useSelector(state => state?.positionChart);


    const [historyDataSummary, setHistoryDataSummary] = useState()
    useEffect(() => {
        const exchanges = new Set()
        const symbols = new Set()

        parityDetails?.forEach(p => {
            exchanges.add(p.leg1.exchange)
            symbols.add(p.leg1.symbol)
            exchanges.add(p.leg2.exchange)
            symbols.add(p.leg2.symbol)
        });
        if (exchanges.size === 0 && symbols.size === 0) return;

        (async () => {
            // setNotifyData((data) => ({
            //     ...data,
            //     loadingFlag: true,
            //     loadingMsg: "fetching data summary...",
            // }));
            try {
                const historyData = await GET_HISTORICAL_DATASUMMARY_API({
                    "fromdate": dateRange.fromdate,
                    "todate": dateRange.todate,
                    "filters": {
                        exchange: [...exchanges],
                        symbol: [...symbols],
                        // exchange: [],
                        // symbol: []
                    }
                })
                // console.log("history", historyData.data.result);
                setHistoryDataSummary(historyData.data.result)
                setNotifyData((prev) => {
                    return {
                        ...prev,
                        loadingFlag: false,
                    };
                });
            } catch (error) {
                console.log(error)
            }


        })()
    }, [parityDetails])


    useEffect(() => {
        // if (!positionData.length || !parityDetails.length || !Object.keys(dateRange).length || !historyDataSummary?.length) return


        const finalData = [];

        (async () => {
            const positionMap = {};

            function mergePositionData(data, isHistorical) {
                if (isHistorical == false && !positionData.length || !parityDetails.length || !Object.keys(dateRange).length) return
                if (isHistorical && !historyDataSummary?.length) return
                const total = {}

                parityDetails.forEach(parity => {
                    data.forEach(entry => {
                        const pos = JSON.parse(JSON.stringify(entry));


                        const key = `${pos.userid}-${pos.opttype}-${parity.parityname}-${isLive}`;
                        const l1Match = parity.leg1.exchange == pos.exchange && parity.leg1.symbol == pos.symbol;
                        const l2Match = parity.leg2.exchange == pos.exchange && parity.leg2.symbol == pos.symbol;

                        if (l1Match || l2Match) {
                            if (isHistorical) {
                                pos.cfqty = 0
                            }
                            const l1 = {
                                cfqty: l1Match && !isHistorical ? (
                                    (opttypeFilter.opttypel1 == [] || opttypeFilter.opttypel1.includes("ALL")) ?
                                        (pos?.cfqty || 0)
                                        : opttypeFilter.opttypel1.includes(pos.opttype) ?
                                            (pos?.cfqty || 0) : 0

                                ) : 0,
                                // cfqty: l1Match ? pos?.cfqty || 0 : 0,
                                netmtm: l1Match ? pos?.netmtm || 0 : 0,
                                basecurrency: l1Match ? pos?.basecurrency || 0 : 0,
                                usdrate: l1Match ? pos?.usdrate : 1,
                                arbnetmtm: !l1Match ? 0 : !isHistorical ? (pos.basecurrency == "USD" ? (pos.netmtm * pos.usdrate) : pos.netmtm || 0) : pos.arbmtm || 0,
                                token: { history: 0 },
                                opttype: l1Match ? pos.opttype : null,
                                // cecfqty: l1Match && pos.opttype == "CE" ? pos?.cfqty || 0 : 0,
                                // pecfqty: l1Match && pos.opttype == "PE" ? pos?.cfqty || 0 : 0,
                                // xxcfqty: l1Match && pos.opttype == "XX" ? pos?.cfqty || 0 : 0
                            };
                            const l2 = {
                                cfqty: l2Match && !isHistorical ? (
                                    (opttypeFilter.opttypel2 == [] || opttypeFilter.opttypel2.includes("ALL")) ?
                                        (pos?.cfqty || 0)
                                        : opttypeFilter.opttypel2.includes(pos.opttype) ?
                                            (pos?.cfqty || 0) : 0

                                ) : 0,
                                // cfqty: l2Match ? pos?.cfqty || 0 : 0,
                                netmtm: l2Match ? pos?.netmtm || 0 : 0,
                                basecurrency: l2Match ? pos?.basecurrency || 0 : 0,
                                usdrate: l2Match ? pos?.usdrate : 1,
                                // arbnetmtm: l2Match && !isHistorical ? (pos.basecurrency == "USD" ? (pos.netmtm * pos.usdrate) : pos.netmtm || 0) : l2Match && isHistorical ? pos.arbmtm || 0 : 0,
                                arbnetmtm: !l2Match ? 0 : !isHistorical ? (pos.basecurrency == "USD" ? (pos.netmtm * pos.usdrate) : pos.netmtm || 0) : pos.arbmtm || 0,
                                token: { history: 0 },
                                opttype: l2Match ? pos.opttype : null,
                                // cecfqty: l2Match && pos.opttype == "CE" ? pos?.cfqty || 0 : 0,
                                // pecfqty: l2Match && pos.opttype == "PE" ? pos?.cfqty || 0 : 0,
                                // xxcfqty: l2Match && pos.opttype == "XX" ? pos?.cfqty || 0 : 0
                            };

                            const tokenKey = isHistorical ? "history" : pos.token
                            // if (l1Match) l1.token[tokenKey] = l1.token[tokenKey] ? l1.token[tokenKey] + pos.netmtm : pos.netmtm
                            // if (l2Match) l2.token[tokenKey] = l2.token[tokenKey] ? l2.token[tokenKey] + pos.netmtm : pos.netmtm
                            if (l1Match) l1.token[tokenKey] ? l1.token[tokenKey] += pos.netmtm : l1.token[tokenKey] = pos.netmtm
                            if (l2Match) l2.token[tokenKey] ? l2.token[tokenKey] += pos.netmtm : l2.token[tokenKey] = pos.netmtm

                            let totalArbmtm = l1Match ? l1.arbnetmtm : 0 + l2Match ? l2.arbnetmtm : 0
                            if (positionMap[key]) {
                                l1.netmtm += positionMap[key].l1.netmtm || 0;
                                l1.cfqty += positionMap[key].l1.cfqty || 0;
                                // l1.cecfqty += positionMap[key].l1.cecfqty || 0;
                                // l2.cecfqty += positionMap[key].l2.cecfqty || 0;
                                // l1.pecfqty += positionMap[key].l1.pecfqty || 0;
                                // l2.pecfqty += positionMap[key].l2.pecfqty || 0;
                                // l1.xxcfqty += positionMap[key].l1.xxcfqty || 0;
                                // l2.xxcfqty += positionMap[key].l2.xxcfqty || 0;
                                l1.arbnetmtm += positionMap[key].l1.arbnetmtm || 0;
                                l2.netmtm += positionMap[key].l2.netmtm || 0;
                                l2.cfqty += positionMap[key].l2.cfqty || 0;
                                l2.arbnetmtm += positionMap[key].l2.arbnetmtm || 0;
                                totalArbmtm += positionMap[key].totalArbmtm || 0;
                                // l1.usdrate = positionMap[key].l1.usdrate;
                                // l2.usdrate = positionMap[key].l2.usdrate

                                // if (isHistorical) {
                                //     if (l1Match) l1.token["history"] += positionMap[key].l1.token["history"]
                                //     if (l2Match) l2.token["history"] += positionMap[key].l2.token["history"]
                                // } else {
                                //     // if (l1Match) l1.token = { ...positionMap[key].l1.token, ...l1.token }
                                //     // if (l2Match) l2.token = { ...positionMap[key].l2.token, ...l2.token }
                                //     if (l1Match) l1.token[tokenKey] = pos.netmtm
                                //     if (l2Match) l2.token[tokenKey] = pos.netmtm
                                // }
                            }



                            const position = {
                                ...pos,
                                l1,
                                l2,
                                totalArbmtm,
                                parityname: parity.parityname,
                                customId: key,
                                oldarbmtm: null,
                                arbdiff: null,
                                savedDate: savedDate[key]
                            }
                            if (prevArbMtm[key]) {
                                position.oldarbmtm = prevArbMtm[key]
                                // position.arbdiff = totalArbmtm - prevArbMtm[key]
                                position.arbdiff = prevArbMtm[key] ? totalArbmtm - (prevArbMtm[key] || 0) : 0
                            }
                            positionMap[key] = position;
                        }
                    });
                });
            }
            if (isLive) {
                mergePositionData(historyDataSummary, true);
                mergePositionData(positionData, false);
                setGridData(Object.values(positionMap))

            }
            else {
                mergePositionData(historyDataSummary, true);
                setGridData(Object.values(positionMap))
            }

        })()

    }, [parityDetails, positionData, gridRef, prevArbMtm, savedDate, isLive, dateRange, onReload, historyDataSummary, opttypeFilter])

    const toggleShowOptions = () => {
        setShowoptions(prev => !prev)
    };
    const toggleDataSummary = () => {
        setShowDataSummary(prev => !prev)
    };
    const onReloadFunc = () => {
        setOnReload(prev => !prev)
    }

    const { gridProps, onReady, GridNotifyData } = useGridSettings({
        gridApi: gridRef,
        onReload: onReloadFunc,
        componentInfo,
        colDef: { data: columnDef },
        settings: {
            sideBar: true,
            sideOptions: {
                "columns": {
                    suppressRowGroups: true,
                    suppressValues: true,
                    suppressPivots: true,
                    suppressPivotMode: true,
                }
            }
        }
    })


    useEffect(() => {
        if (!positionData?.length) return
        onReady()
    }, [positionData])

    const [componentSetting, setComponentSetting] = useState(null)

    useEffect(() => {

        (async () => {
            try {
                const { data } = await GET_COMPONENTSETTING_API(componentInfosaved)
                setComponentSetting(data.result)

                const setting = data.result[componentInfosaved.componenttype]?.setting

                if (setting) {
                    if (setting["parityDetails"]) setParityDetails(setting["parityDetails"])
                    if (setting["prevArbMtm"]) setPrevArbMtm(setting["prevArbMtm"])
                    if (setting["savedDate"]) setSavedDate(setting['savedDate'])
                }
            } catch (error) {
                console.log({ errorrrrr: error })
            }
        })()
    }, [])


    useEffect(() => {
        if (componentSetting === null) return
        const id = componentSetting[componentInfosaved.componenttype]?.id

        const body = {
            event: id ? "update" : "create",
            data: {
                ...componentInfosaved,
                setting: { parityDetails, prevArbMtm, savedDate },
            },
        }
        if (id) body.data["id"] = id;

        (async () => {
            try {
                const { data } = await POST_COMPONENTSETTING_API(body)
            } catch (error) {
                console.log({ error })
            }
        })()
    }, [parityDetails, componentSetting, prevArbMtm, savedDate])

    //----------------------- END SAVE WORKSPACE ------------------------------------------------

    const [total, setTotal] = useState({ "l1": { cfqty: 0, netmtm: 0 }, "l2": { cfqty: 0, netmtm: 0 }, totalArbmtm: 0, oldarbmtm: 0, arbdiff: 0 })

    const calcTotal = () => {
        const t = { "l1": { cfqty: 0, netmtm: 0 }, "l2": { cfqty: 0, netmtm: 0 }, totalArbmtm: 0, oldarbmtm: 0, arbdiff: 0 }
        gridRef.current.api.forEachNodeAfterFilterAndSort((row) => {
            if (row.data) {
                t["l1"]["cfqty"] += row.data["l1"]["cfqty"]
                t["l1"]["netmtm"] += row.data["l1"]["netmtm"]
                t["l2"]["cfqty"] += row.data["l2"]["cfqty"]
                t["l2"]["netmtm"] += row.data["l2"]["netmtm"]
                t["oldarbmtm"] += row.data["oldarbmtm"] || 0
                t["arbdiff"] += row.data["arbdiff"] || 0
                t["totalArbmtm"] += row.data["totalArbmtm"] || 0
            }
        })
        setTotal(t)
    }


    const opttypefilterSelected = (selectedval, name) => {

        setOpttypeFilter(prev => ({ ...prev, [name]: selectedval == undefined ? [] : selectedval }))
    }



    return (
        <div style={{ height: "100%" }}>
            <div className={style.settingIcon} >
                <SlSettings onClick={toggleShowOptions} />
            </div>
            <div className={style.fullscreen} >
                <TbMaximize onClick={toggleDataSummary} />
            </div>

            <OptType className={style.opttypefilter} opttypefilterSelected={opttypefilterSelected} opttypeFilter={opttypeFilter} />
            <div className={style.isLive} >
                LIVE <input type='checkbox' checked={isLive} onClick={(e) => setIsLive(e.target.checked)} />
            </div>

            <div style={{ height: "95%", marginTop: '0.5rem' }} >
                <AgGridReact
                    {...gridProps}
                    ref={gridRef}
                    rowData={gridData}
                    // columnDefs={columnDef}
                    // onModelUpdated={calcTotal}
                    getRowId={p => p.data.customId}
                    pagination={false}
                    suppressAggFuncInHeader={true}
                // pinnedBottomRowData={[total]}
                />
            </div>

            <ModalPopup
                size={"lg"}
                fullscreen={false}
                title={"Create Pair Name"}
                flag={showOptions}
                close={toggleShowOptions}
                component={
                    <DataSummaryConfigure shareParityData={setParityDetails} parityDetails={parityDetails} toggleShowOptions={toggleShowOptions} />
                }
            />
            <ModalPopup
                size={"lg"}
                fullscreen={true}
                title={"Data Summary"}
                flag={showDataSummary}
                close={toggleDataSummary}
                component={
                    <>
                        <OptType className={style.opttypefilter1} opttypefilterSelected={opttypefilterSelected} opttypeFilter={opttypeFilter} />

                        <div style={{ height: "99%" }} >
                            <AgGridReact
                                {...gridProps}
                                ref={gridRef}
                                rowData={gridData}
                                // columnDefs={columnDef}
                                // onModelUpdated={calcTotal}
                                getRowId={p => p.data.customId}
                                pagination={false}
                                suppressAggFuncInHeader={true}
                            // pinnedBottomRowData={[total]}
                            />
                        </div>
                    </>
                }
            />
            <Notification
                notify={NotifyData}
            />
        </div>
    )
}

export default DataSummary