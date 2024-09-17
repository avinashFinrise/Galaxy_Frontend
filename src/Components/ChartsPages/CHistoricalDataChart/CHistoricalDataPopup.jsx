import tableStyle from "../MTMChart/MtmPopupTable.module.scss";
import { useCallback, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { redGreenRowText } from "../../../UtilityFunctions/grid";

const CHistoricalDataPopup = ({ tableData }) => {
  const gridRef = useRef();
  const getRowId = useCallback((params) => {
    return params.data.date;
  });

  const defaultColDef = useMemo(() => {
    return {
      // editable: true,
      // sortable: true,
      flex: 1,
      minWidth: 100,
      // // filter: true,
      resizable: true,
      // filter: "agTextColumnFilter",
      floatingFilter: true,
      // cellDataType: false,
      width: 100,
      editable: false,
      filter: "agTextColumnFilter",
      // menuTabs: ["filterMenuTab"],
    };
  }, []);

  const numberformatter = Intl.NumberFormat("en-US", {
    // style: "currency",
    // currency: "INR",
    maximumFractionDigits: 0,
  });

  let myValueFormatter = (p) => numberformatter.format(p.value);


  const columnCreation = useMemo(() => {
    let columns = [];
    if (tableData.length > 0) {
      for (let key in tableData[0]) {
        if (key.includes("amt")) {
          columns.push({
            headerName: key.toUpperCase(),
            field: key,
            sortable: true,
            // filter: false,

            valueFormatter: myValueFormatter,
            aggFunc: "sum",
            cellStyle: redGreenRowText
          });
        } else {
          columns.push({
            field: key,
            headerName: key.toUpperCase(),
            sortable: true,
            // filter: true,
          });
        }
      }
    }

    return columns;
  }, [tableData]);
  return (
    <div className={`popup-tableSection ${tableStyle.popupTableSection}`}>
      {/* <div className={tableStyle.popupTableHeader}>
        <div>
          <button
            className={`column-save-btn ${tableStyle.columnSaveBtn} ${tableStyle.columnSaveBtn1}`}
          >
            <span className={tableStyle.textBtnContent}> Save column </span>
            <span className={tableStyle.btnIcon}>
              <LiaSave />
            </span>
          </button>
        </div>
      </div> */}
      <div style={{ height: "86vh" }}>
        <AgGridReact
          className="ag-theme-alpine"
          ref={gridRef}
          rowData={tableData}
          columnDefs={columnCreation}
          // getRowId={getRowId}
          defaultColDef={defaultColDef}
          // sideBar={sideBar}
          asyncTransactionWaitMillis={500}
          pagination={true}
          paginationPageSize={50}
        // groupIncludeFooter={true}
        // groupIncludeTotalFooter={true}
        />
      </div>
    </div>
  );
};

export default CHistoricalDataPopup;
