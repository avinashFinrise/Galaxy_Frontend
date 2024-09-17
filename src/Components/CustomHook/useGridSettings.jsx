import { useCallback, useEffect, useMemo, useState } from 'react';
import { GET_COMPONENTSETTING_API, POST_COMPONENTSETTING_API } from '../../API/ApiServices';
import { sideBar } from '../../UtilityFunctions/grid';

const defaultColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    width: 150,
    editable: true,
    filter: true,
    aggFunc: 'sum',

};


function useGridSettings({
    gridApi,
    componentInfo,
    onReload,
    colDef,
    contextMenu = [],
    groupBy = [],
    settings = {
        sideBar: true
    }

}) { //componentInfo: { componentname: "position", componenttype: "table" }
    const [isReady, setIsReady] = useState(0)
    const [error, setError] = useState(null)
    const [componentSetting, setComponentSetting] = useState({})
    const [columnDefs, setColumnDefs] = useState([])


    // const [NotifyData, setGridNotifyData] = useState({
    //     confirmFlag: false,
    //     confirmMsg: "confirm msg",
    //     successFlag: false,
    //     successMsg: "success msg",
    //     errorFlag: false,
    //     errorMsg: "error msg",
    //     loadingFlag: false,
    //     loadingMsg: "loading msg",
    //     activesession: false,
    //     headerMsg: "error ",
    // });

    // const CloseError = () => {
    //     setGridNotifyData((data) => ({ ...data, errorFlag: false }));
    // };
    // const CloseSuccess = () => {
    //     setGridNotifyData((data) => ({ ...data, successFlag: false }));
    // };





    const saveToSettingState = (name, data) => {
        setComponentSetting(p => {
            const newdata = { ...p }

            if (!newdata.table) newdata.table = {};
            if (!newdata.table.setting) newdata.table.setting = {};
            newdata.table.setting[name] = data
            // console.log({ data })
            return newdata
        })
    }
    const [GridNotifyData, setGridNotifyData] = useState({
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


    // console.log(componentSetting)


    const saveToApi = async (settings) => {

        const id = componentSetting?.table?.id
        try {
            const body = {
                event: id ? 'update' : 'create',
                data: { ...componentInfo, setting: componentSetting.table?.setting }
            }

            if (id) body.data['id'] = id

            const { data } = await POST_COMPONENTSETTING_API(body);
            // console.log("data", data);
            if (data.status == "success") {

                setGridNotifyData(prev => ({
                    ...prev, successFlag: true,
                    successMsg: data.result,
                }))

            }

        } catch (e) {
            console.log({ e });
        }
    }



    const onColumnMoved = useCallback(async (p) => {
        let columnState = null;

        if (!p) columnState = null;
        else columnState = JSON.stringify(p.columnApi.getColumnState().reduce((res, curr) => {
            if (curr.colId !== "ag-Grid-AutoColumn") res.push(curr.colId)
            return res
        }, []));


        saveToSettingState("colDef", columnState)
    }, [componentSetting]);

    const onFiltersReset = useCallback(async () => {
        gridApi.current.api.setFilterModel(null)
        saveToSettingState("filters", null)
        // saveToSettingState("colVisibility", {})  
        // saveToSettingState("pinnedRow", {})

        // saveToApi({ filters: null, colVisibility: {} })
    }, [gridApi, componentSetting])

    const handleComponentSetting = useCallback((e) => {
        saveToSettingState("filters", gridApi.current.api.getFilterModel())
    }, [gridApi, componentSetting])

    // console.log({ componentSetting })

    useEffect(() => {
        if (!isReady) return
        (async () => {
            try {
                //
                const { data } = await GET_COMPONENTSETTING_API({ componentname: componentInfo.componentname });
                // console.log(data, componentInfo.componentname) 
                setComponentSetting(data?.result)


                //Generating ColDef

                const defaultColDef = {}
                if (colDef.data) Object.values(colDef.data).forEach(e => {
                    if (e.field) defaultColDef[e.field] = e

                    else {

                        e.children?.forEach(c => defaultColDef[c.field] = c)
                    }
                })
                // console.log(defaultColDef)


                let toGenrate = null;
                // console.log(data.result?.table?.setting?.colDef) //yha pe bhi aa rha hai
                if (data.result?.table?.setting?.colDef) toGenrate = JSON.parse(data.result?.table?.setting.colDef)

                else {
                    toGenrate = Object.keys(colDef?.row || {})
                    if (!colDef?.row) {
                        toGenrate = Object.keys(defaultColDef)
                    }
                }
                // console.log(toGenrate)


                const dbCallVisibility = data.result?.table?.setting?.colVisibility || {}
                const dbPinned = data.result?.table?.setting?.pinnedRow || {}
                const pivotInfo = data.result?.table?.setting?.pivotInfo || {}  //add new line


                // console.log({ pivotInfo })

                const generatedColumns = []
                // console.log({ toGenrate })
                toGenrate.forEach(e => {
                    let res = colDef?.generateColDef ? colDef?.generateColDef(e) : {}
                    if (defaultColDef[e]) res = defaultColDef[e]
                    if (res) {
                        res["floatingFilter"] = false
                        if (groupBy?.includes(e)) res["enableRowGroup"] = true

                        if (dbPinned[e]) res["pinned"] = dbPinned[e]
                        if (pivotInfo[e]) res = { ...res, ...pivotInfo[e] }  //add new line
                        // console.log(res)
                        if (dbCallVisibility[e] !== undefined) res["hide"] = !dbCallVisibility[e];
                        // console.log({ res }) 
                        generatedColumns.push(res)
                    }
                })
                // console.log({ generatedColumns, dbCallVisibility, dbPinned });



                const final = {}
                Object.values(generatedColumns).forEach(e => {
                    if (e.headerName || e.field) {
                        if (e.field?.includes(".")) {
                            const [_, parent] = e.field.split(".")
                            if (!final[parent]) final[parent] = { headerName: parent.toUpperCase(), children: [e] }
                            else final[parent].children.push(e)
                        } else {
                            final[e.field] = e
                        }
                    }
                })
                // console.log({ final: Object.values(final) })
                setColumnDefs(Object.values(final))
            } catch (error) {
                console.log(error)
                setError("Failed to Fetch Component Setting")
            }
        })();
    }, [componentInfo, gridApi, isReady])



    useEffect(() => {
        // console.log(componentSetting)
        if (!gridApi.current && !isReady) return
        gridApi.current?.api?.setFilterModel(componentSetting?.table?.setting?.filters || {});
    }, [componentSetting, gridApi.current, isReady])



    const getContextMenuItems = useCallback((params) => {
        var result = [...contextMenu];

        if (onReload) {
            result.push({
                name: "Reload",
                action: onReload,
                icon: '<span class="ag-icon ag-icon-loading" unselectable="on" role="presentation"></span>'
            })
        }
        result.push("export")
        result.push({
            name: "Save Settings",
            action: () => saveToApi(null),
            icon: '<span class="ag-icon ag-icon-save" unselectable="on" role="presentation"></span>'
        })
        result.push({
            name: "Reset Columns def",
            action: () => onColumnMoved(null),
            icon: '<span class="ag-icon ag-icon-columns" unselectable="on" role="presentation"></span>'
        })
        result.push({
            name: "Reset All Filters",
            action: onFiltersReset,
            icon: '<span class="ag-icon ag-icon-filter" unselectable="on" role="presentation"></span>'
        })


        return result;
    }, [componentInfo, componentSetting]);

    const handleColHideVisible = (e) => {
        // console.log(e)
        const prev = componentSetting.table.setting?.colVisibility || {}

        // saveToSettingState("colVisibility", { ...prev, [e.column?.colId]: e.column.visible }) //old

        //new add
        // console.log(prev)
        const final = { ...prev }
        if (!e.column) Object.keys(final).forEach(lol => final[lol] = e.visible)
        else final[e.column?.colId] = e.column.visible

        saveToSettingState("colVisibility", final)
    }




    // add new
    const hanlePivotChange = () => {
        const columnApi = gridApi.current.columnApi;
        const allColumns = columnApi.getAllColumns();
        const res = {}

        allColumns.forEach(column => {
            // console.log({ column3: column.aggFunc, column: column, })
            res[column.colId] = { rowGroup: column.rowGroupActive, aggFunc: column.aggFunc }
        });
        console.log({ res })
        saveToSettingState("pivotInfo", res)

    }

    const handleColPin = (e) => {
        const prev = componentSetting.table.setting?.pinnedRow || {}
        saveToSettingState("pinnedRow", { ...prev, [e.column?.colId]: e.column.pinned })
    }




    const items = useMemo(() => (
        settings.sideBar && !settings.sideOptions ? { toolPanels: sideBar } : {
            toolPanels: sideBar.map(e => {
                const toolPanelParams = Object.keys(settings.sideOptions).find(id => e.id == id) || {}
                e.toolPanelParams = settings.sideOptions[toolPanelParams]
                // console.log(e)
                return e
            })
        }
    ), [])
    const gridProps = useMemo(() => ({
        gridOptions: { headerHeight: 30, },
        onColumnMoved: onColumnMoved,
        onFilterChanged: handleComponentSetting,

        getContextMenuItems: getContextMenuItems,
        // isPivotMode: pivotemode,
        // getPivotColumns: getPivotemode,
        onColumnVisible: handleColHideVisible,
        defaultColDef: defaultColDef,
        columnDefs: columnDefs,
        sideBar: items,
        onColumnPinned: handleColPin,
        rowGroupPanelShow: groupBy.length ? 'always' : false,
        onColumnRowGroupChanged: hanlePivotChange,   //add new
        // onColumnAggFuncChange: updateAggFunc('sum'),

        debounceVerticalScrollbar: true,
        className: "ag-theme-alpine",
        asyncTransactionWaitMillis: 500,
        // isPivotMode: pivotMode, // Set pivot mode state
        // onPivotModeChanged: handlePivotModeChange, // Handle pivot mode changes

    }), [componentInfo, componentSetting, columnDefs])

    // console.log(componentInfo, componentSetting, columnDefs)

    const onReady = useCallback(() => setIsReady(p => p + 1))
    const saveColDef = useCallback(() => onColumnMoved(gridApi.current), [gridApi.current])
    return { componentSetting, GridNotifyData, setGridNotifyData, gridProps, error, onReady, saveColDef }

}

export default useGridSettings
