import { AgGridReact } from 'ag-grid-react';
import { useMemo, useRef } from 'react';
import { formatValue } from '../../../../UtilityFunctions/grid';

const defaultColDef = {
    sortable: true,
    flex: 1,
    minWidth: 100,
    resizable: true,
    floatingFilter: false,
    width: 100,
    editable: false,
    filter: "agTextColumnFilter",
};


const defaultPinnedRow = { netmtm_rec: 0, netmtm_diff: 0, netmtm_csv: 0 }
const sideBar = { toolPanels: ["filters"] };

function VerifiedReportsTable({ data = [] }) {
    const gridApi = useRef()

    const rowClassRules = useMemo(() => {
        return {
            'redRow': (params) => params.data?.netmtm_diff != 0,
        };
    }, []);

    const handleTotal = () => {
        const total = { ...defaultPinnedRow }
        if (!gridApi.current) return
        gridApi.current.api.forEachNodeAfterFilterAndSort(e => {
            total["netmtm_rec"] += e.data["netmtm_rec"]
            total["netmtm_diff"] += e.data["netmtm_diff"]
            total["netmtm_csv"] += e.data["netmtm_csv"]
        })
        gridApi.current.api.setPinnedBottomRowData([total])
    }


    const columnCreation = useMemo(() => {
        let columns = [];
        if (data.length > 0) {
            for (let key in data[0]) {
                columns.push({
                    field: key,
                    headerName: key.toUpperCase(),
                    sortable: true,
                    filter: true,
                    valueFormatter: formatValue
                });
            }
        }
        return columns;
    }, [data]);

    return (
        <div style={{ height: "500px", padding: "0 1rem" }}>
            <AgGridReact
                ref={gridApi}
                className="ag-theme-alpine"
                rowData={data}
                columnDefs={columnCreation}
                getRowId={p => Object.values(p.data)}
                defaultColDef={defaultColDef}
                // defaultValue={[dayjs(date.fromdate), dayjs(date.todate)]}
                sideBar={sideBar}
                pagination={true}
                debounceVerticalScrollbar={true}
                rowClassRules={rowClassRules}
                pinnedBottomRowData={[defaultPinnedRow]}
                onModelUpdated={handleTotal}
            // paginationPageSize={50}
            />
        </div>
    )
}

export default VerifiedReportsTable