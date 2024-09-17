import React, { useCallback, useState } from "react";
import { LiaSave } from "react-icons/lia";
import { DatePicker } from "antd";
// import { MtmGrid } from "../../TableComponent";
import tableStyle from "./MtmPopupTable.module.scss";
import { shallowEqual, useSelector } from "react-redux";
import dayjs from "dayjs";
import {
  POST_COMPONENTSETTING_API,
} from "../../../API/ApiServices";
import MtmGrid from "../../TableComponent/MtmGrid";
import { Notification } from "../../DynamicComp/Notification";

let defaultGroupingBySymbol = [

  "exchange",
  "symbol",
  // "expirydate",
  // "opttype",
  // "strikeprice",
  // "clustername",
  "groupname",
  "userid",
];


const MtmSymbolWiseTable = ({ basecurrency, bftd }) => {
  const dateRange = useSelector((state) => state.dateRange, shallowEqual);
  const [date, setDate] = useState({
    fromdate: dateRange.fromdate,
    todate: dateRange.todate,
  });
  const [columnSetting, setColumnSetting] = useState({});

  // const mtm = useSelector((state) => state.mtm, shallowEqual);
  const positionType = useSelector(
    (state) => state.positionTypeInMtm,
    shallowEqual
  );

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
  const CloseError = () => {
    setNotifyData((data) => ({ ...data, errorFlag: false }));
  };
  const CloseSuccess = () => {
    setNotifyData((data) => ({ ...data, successFlag: false }));
  };
  const handleDataFromTable = useCallback(async (data) => {
    setColumnSetting(data);
  }, [])

  const saveComponentSettings = async () => {
    const componentSetting = await POST_COMPONENTSETTING_API({
      data: columnSetting,
      event: columnSetting.id ? "update" : "create",
    });
  };

  const handleDatePickerChange = (data, dateString) => {
    setDate((previous) => ({
      ...previous,
      fromdate: dateString[0],
      todate: dateString[1],
    }));
  };


  return (
    <div className={`popup-tableSection ${tableStyle.popupTableSection}`}>
      <div
        className={`${tableStyle.popupTableHeader} ${tableStyle.popupTableHeaderWithDate}`}
      >
        <div className={tableStyle.noteSection}>
          <p>
            NOTE: As Per Product wise /{" "}
            {`${basecurrency.toUpperCase()}/${bftd?.toUpperCase()}`}
          </p>
        </div>
        <div
          className={`${tableStyle.dateSection} dateSection popupdateSection`}
        >
          <div className={tableStyle.datesinglesection}>
            <p>Select Date Range</p>
            <DatePicker.RangePicker
              disabled
              onChange={handleDatePickerChange}
              format="YYYY-MM-DD" // Specify the date format
              placeholder={["Start Date", "End Date"]}
              defaultValue={[dayjs(date.fromdate), dayjs(date.todate)]}
              // renderExtraFooter={() => "extra footer"}
              allowClear={true} // Set to true if you want to allow clearing the
              className={tableStyle.datePicker}
            />
          </div>
        </div>
        {/* <div className={tableStyle.selectionSection}>
          <Form.Select name="" id="" className={tableStyle.formSelect}>
            <option value="">Exchange</option>
            <option value="">sgx</option>
          </Form.Select>
          <Form.Select name="" id="" className={tableStyle.formSelect}>
            <option value="">Segmanet</option>
            <option value="">sgx</option>
          </Form.Select>
          <Form.Select name="" id="" className={tableStyle.formSelect}>
            <option value="">group</option>
            <option value="">sgx</option>
          </Form.Select>
          <Form.Select name="" id="" className={tableStyle.formSelect}>
            <option value="">client</option>
            <option value="">sgx</option>
          </Form.Select>
          <Form.Select name="" id="" className={tableStyle.formSelect}>
            <option value="">product</option>
            <option value="">sgx</option>
          </Form.Select>
        </div> */}

        <div>
          <button
            className={`column-save-btn ${tableStyle.columnSaveBtn}`}
            onClick={saveComponentSettings}
          >
            <span className={tableStyle.textBtnContent}> Save column </span>
            <span className={tableStyle.btnIcon}>
              <LiaSave />
            </span>
          </button>
        </div>
      </div>
      {/* <Mtm view={'symbolwise'}/> */}
      <div className="popup-custom-table">
        {/* <PositionGrid
          view={"symbol"}
          table={"mtm"}
          dateRange={date}
          onDataFromTable={handleDataFromTable}
        /> */}
        <MtmGrid
          bftd={bftd}
          view={"symbol"}
          defaultGroupingBySymbol={defaultGroupingBySymbol}
          dateRange={date}
          onDataFromTable={handleDataFromTable}
          basecurrency={basecurrency}
        />
      </div>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      />
    </div>
  );
};

export default React.memo(MtmSymbolWiseTable);
