import { useEffect, useRef, useState } from "react";
import { Dropdown, Form } from "react-bootstrap";
// import tableStyle from "../MTMChart/MtmPopupTable.module.scss";
import altStyle from "./SymbolWiseLimitTable.module.scss";
// import altStyle from "../AlertCard/AlertCard.module.scss";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
// import { Dropdown, Form } from "react-bootstrap";
import { IoEnter } from "react-icons/io5";
import { shallowEqual, useSelector } from "react-redux";
import { GET_COMPONENTSETTING_API, GET_MARGIN_CONFIG_API, GET_NETPOSITION_API, POST_COMPONENTSETTING_API } from "../../../API/ApiServices";
import SymbolTable from "../../TableComponent/SymbolTable";
import { calculateMargin, createMarginDataset } from "../../../UtilityFunctions/MarginCalculation";
import { Notification } from "../../DynamicComp/Notification";
let symbolWise_limit_table_id
// let isInitialSetupDone = false;
const SymbWiseLimitTable = () => {
  const gridRef = useRef();
  let columnList = ["userid", "allowed", "usedlimit", "pendinglimit"];
  const position = useSelector((state) => state?.positionChart);
  const get_spanData = useSelector((state) => state.spanData, shallowEqual);
  const [filterOptions, setFilterOptions] = useState({ currency: ["USD", "INR"] });
  const [marginConfigResult, setMarginConfigResult] = useState();
  const [symbolWiseTable, setSymbolWiseTable] = useState([])
  const [useridWiseTable, setUseridWiseTable] = useState([])
  const [selectedOptions, setSelectedOptions] = useState(
    {
      currency: [],
      exchange: [],
      cluster: [],
      groupname: [],
    })
  const [curruncyWiseTables, setCurruncyWiseTables] = useState()

  const [limitTableData, setLimitTableData] = useState([])

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
  // const getRowId = useCallback((params) => {
  //   return params.data.positionno;
  // });


  const createDataByKey = async (dataCreationKey) => {
    if (selectedOptions?.currency.length == 0 && selectedOptions?.exchange.length === 0 && selectedOptions?.cluster.length === 0 && selectedOptions?.groupname.length === 0) {
      console.log("select filters first");

    }
    else {
      setCurruncyWiseTables(selectedOptions?.currency[0])

      const filteredPosition = position?.filter((obj) =>

        (selectedOptions?.currency.length === 0 ||
          selectedOptions?.currency?.some((selectedCurrency) =>
            obj.basecurrency.includes(selectedCurrency)
          )) &&
        (selectedOptions?.exchange.length === 0 ||
          selectedOptions?.exchange?.some((selectedExchange) =>
            obj.exchange_id.toString().includes(selectedExchange.toString())
          )) &&
        (selectedOptions?.cluster.length === 0 ||
          selectedOptions?.cluster?.some((selectedCluster) =>
            obj.cluster_id.toString().includes(selectedCluster.toString())
          )) &&
        (selectedOptions?.groupname.length === 0 ||
          selectedOptions?.groupname?.some((selectedGroup) =>
            obj.group_id.toString().includes(selectedGroup.toString())
          ))

      );




      const matchingConfig = marginConfigResult.filter((obj1) => {
        return filteredPosition.some((obj2) => {
          return obj1.exchange.toString() == obj2.exchange_id.toString() &&
            obj1.cluster.toString() == obj2.cluster_id.toString() &&
            obj1.group.toString() == obj2.group_id.toString()
        })
      })

      // console.log("matchingConfig", matchingConfig, filteredPosition, marginConfigResult);
      let sumArray
      if (matchingConfig && matchingConfig.length > 0) {
        // Use reduce to create an array of objects with symbol and allowed
        sumArray = matchingConfig.reduce((acc, config) => {
          const key = config[dataCreationKey].toString();
          const allowed = config.allowed || 0; // Assume default value is 0 if allowed is undefined
          console.log("key", key);
          // Check if an object with the same key already exists in the array
          const existingItem = acc.find((item) => item[dataCreationKey] === key);

          if (existingItem) {
            // If the key already exists, update its allowed value
            existingItem.allowed += allowed;
          } else {
            // If the key doesn't exist, add a new object to the array
            acc.push({ [dataCreationKey]: key, allowed });
          }

          return acc;
        }, []);

        // sumArray now contains the sum of allowed values grouped by the specified property
      }




      let newRes
      if (selectedOptions?.currency[0] == "INR") {
        const res = createMarginDataset(dataCreationKey, filteredPosition);
        newRes = res.map((val) => {
          const [margin, exposure] = calculateMargin(
            val?.data,
            get_spanData,
            filteredPosition
          );
          console.log(margin, exposure);
          val["margin"] = margin;
          delete val.data;
          return val;
        });
      } else if (selectedOptions?.currency[0] == "USD") {
        const groupedData = filteredPosition?.reduce((result, obj) => {
          const key = obj[dataCreationKey]; // Use dataCreationKey dynamically as the key
          const cfqty = obj["cfqty"];

          if (result[key]) {
            result[key].margin = (result[key].margin || 0) + cfqty;
          } else {
            result[key] = {
              [dataCreationKey]: key,
              margin: cfqty,
            };
          }

          return result;
        }, {});
        newRes = Object.values(groupedData)
      }

      console.log("newRes", newRes, sumArray);
      const resultArray = newRes.map(item1 => {
        const matchingItem = sumArray?.find(item2 => item2[dataCreationKey] === item1[dataCreationKey]);
        if (matchingItem) {
          return {
            ...item1,

            AllowedMargin: matchingItem?.allowed,
            RemainingMargin: matchingItem.allowed - Math.abs(item1.margin)
          };
        }
        else {

          return {
            ...item1,
            AllowedMargin: null,
            RemainingMargin: null
          }
        }
      });

      if (dataCreationKey == "symbol") {

        setSymbolWiseTable(resultArray)
      }
      if (dataCreationKey == "userid") {

        setUseridWiseTable(resultArray)
      }

    }

  };
  // useEffect(() => {
  //   (async () => {
  //     const marginConfig = await GET_MARGIN_CONFIG_API()
  //     if (marginConfig) {

  //       setMarginConfigResult(marginConfig?.data?.result);
  //     }
  //   })();
  // }, [])

  useEffect(() => {

    (async () => {
      try {
        const componentSettingfetch = await GET_COMPONENTSETTING_API({
          componentname: "symbolWise_limit_table",
        });

        symbolWise_limit_table_id = componentSettingfetch?.data?.result?.symbolwise?.id
        // setLimitReachedComponnentSetting(
        //   componentSettingfetch?.data?.result?.symbolwise?.setting
        // );
        console.log("symbolwise", componentSettingfetch?.data?.result?.symbolwise?.setting);
        if (componentSettingfetch?.data?.result?.symbolwise?.setting) {
          console.log("symbolwise", componentSettingfetch?.data?.result?.symbolwise?.setting);

          const filterAndCompare = (symbol, selected) => {
            const filteredOptions = {};

            selected && Object.keys(selected).forEach(key => {
              // console.log("key", key);
              if (key === 'currency') {
                // Compare currency directly
                filteredOptions[key] = selected[key].filter(currency => symbol[key]?.includes(currency));
              } else {
                // Compare other options after _
                // filteredOptions[key] = selected[key]?.filter(option => symbol[key]?.toString().split("_")[1]?.includes(option));
                filteredOptions[key] = selected[key].filter(option => symbol[key].map(val => val.split("_")[val?.split("_")?.length - 1]).includes(`${option}`))
              }
            });

            return filteredOptions;
          };

          // Filter and compare values
          const filteredValues = filterAndCompare(componentSettingfetch?.data?.result?.symbolwise?.setting.filterOptions, componentSettingfetch?.data?.result?.symbolwise?.setting.selectedOptions);

          setSelectedOptions(filteredValues)
          setFilterOptions({ ...(componentSettingfetch?.data?.result?.symbolwise?.setting.filterOptions), currency: ["USD", "INR"] })
        }
        const marginConfig = await GET_MARGIN_CONFIG_API()
        if (marginConfig) {

          setMarginConfigResult(marginConfig?.data?.result);
        }
        // isInitialSetupDone = true;
        // if (componentSettingfetch?.data?.result?.symbolwise?.setting.selectedOptions) {
        //   setTimeout(() => {
        //     console.log("settimoutcalled");
        //     runCreateData()
        //   }, 10000);
        // }

      } catch (error) {
        console.log(error);
      }
    })();

    getSpanData();
  }, []);
  // useEffect(() => {
  //   if (isInitialSetupDone) {
  //     console.log("Initial setup done. Calling runCreateData.");
  //     runCreateData();
  //   }
  // }, [isInitialSetupDone]);
  useEffect(() => {

    (async () => {
      try {
        await createDataByKey("symbol")
        await createDataByKey("userid")
      } catch (error) {
        console.log(error);
      }
    })();


  }, [marginConfigResult])


  const runCreateData = async () => {



    // saveToLS("selectedOptionsSymbolTable", selectedOptions)
    // saveToLS("filterOptionsSymbolTable", filterOptions)
    const componentSettingPost = await POST_COMPONENTSETTING_API({
      event: symbolWise_limit_table_id ? "update" : "create",
      data: {

        ...(symbolWise_limit_table_id && { id: symbolWise_limit_table_id }),
        componentname: "symbolWise_limit_table",
        componenttype: "symbolwise",

        setting: { selectedOptions: selectedOptions, filterOptions: filterOptions },
      },
    });
    await createDataByKey("symbol")
    await createDataByKey("userid")


  };


  // const defaultColDef = useMemo(() => {
  //   return {
  //     // editable: true,
  //     // sortable: true,
  //     flex: 1,
  //     minWidth: 100,
  //     // // filter: true,
  //     resizable: true,
  //     // filter: "agTextColumnFilter",
  //     floatingFilter: true,
  //     // cellDataType: false,
  //     width: 100,
  //     editable: true,
  //     filter: "agTextColumnFilter",
  //     // menuTabs: ["filterMenuTab"],
  //   };
  // }, []);

  // const columnCreation = useMemo(() => {
  //   let columns = [];
  //   for (let key in tableData[0]) {
  //     if (columnList.indexOf(key) > -1) {
  //       columns.push({
  //         field: key,
  //         headerName: key.toUpperCase(),
  //         sortable: true,
  //       });
  //     }
  //   }
  //   return columns;
  // }, [tableData]);
  const selectAllCheckedcluster =
    selectedOptions?.cluster?.length === filterOptions?.cluster?.length;
  const selectAllCheckedGroupName =
    selectedOptions?.groupname?.length === filterOptions?.groupname?.length;

  const handleCheckboxChange = async (e) => {

    let updatedCurrency = [];
    let updatedExchange = [];
    let updatedCluster = [];
    let updatedGroup = [];
    if (e.target.name == "currency") {
      updatedCurrency = selectedOptions.currency.includes(e.target.value)
        ? selectedOptions.currency.filter(
          (currency) => currency !== e.target.value
        )
        : [...selectedOptions.currency, e.target.value];

      setSelectedOptions((previous) => ({
        ...previous,
        currency: [e.target.value],
        exchange: [],
        cluster: [],
        groupname: [],
      }));

      if (e.target.value == "INR") {
        setFilterOptions((previous) => ({
          ...previous,
          exchange: [...new Set(position?.filter(obj => obj.basecurrency.toLowerCase() == e.target.value.toLowerCase()).map(obj => `${obj.exchange + "_" + obj.exchange_id}`))],
          cluster: [],
          groupname: [],

        }))
      }
      if (e.target.value == "USD") {
        setFilterOptions((previous) => ({
          ...previous,
          exchange: [...new Set(position?.filter(obj => obj.basecurrency.toLowerCase() == e.target.value.toLowerCase()).map(obj => `${obj.exchange + "_" + obj.exchange_id}`))],
          cluster: [],
          groupname: [],
        }))
      }
    }


    if (e.target.name == "exchange") {
      updatedExchange = selectedOptions.exchange.includes(e.target.value)
        ? selectedOptions.exchange.filter(
          (exchange) => exchange !== e.target.value
        )
        : [...selectedOptions.exchange, e.target.value];

      setSelectedOptions((previous) => ({
        ...previous,
        exchange: updatedExchange,
        cluster: [],
        groupname: [],
      }));

      setFilterOptions((previous) => {

        const filteredClusters = new Set(
          position
            ?.filter((obj) => updatedExchange.includes(obj.exchange_id?.toString()))
            .map((obj) => `${obj.clustername + "_" + obj.cluster_id}`)
        );

        return {
          ...previous,

          cluster: [...filteredClusters],
        }
      })
    }


    if (e.target.name == "cluster") {
      if (e.target.id == "selectAll") {
        const allselectedCluster = selectAllCheckedcluster ? [] : filterOptions?.cluster.map(option => option.split('_')[option?.split('_')?.length - 1])
        setSelectedOptions((previous) => ({
          ...previous,
          cluster: allselectedCluster,
          groupname: [],
        }));



        setFilterOptions((previous) => {

          const filteredGroup = new Set(
            position
              ?.filter((obj) => allselectedCluster.includes(obj.cluster_id.toString()))
              .map((obj) => `${obj.groupname + "_" + obj.group_id}`)
          );

          return {
            ...previous,

            groupname: [...filteredGroup],
          }
        })



      } else {
        updatedCluster = selectedOptions.cluster.includes(e.target.value)
          ? selectedOptions.cluster.filter(
            (cluster) => cluster !== e.target.value
          )
          : [...selectedOptions.cluster, e.target.value];

        setSelectedOptions((previous) => ({
          ...previous,
          cluster: updatedCluster,
        }));

        setFilterOptions((previous) => {

          const filteredGroup = new Set(
            position
              ?.filter((obj) => updatedCluster.includes(obj.cluster_id.toString()))
              .map((obj) => `${obj.groupname + "_" + obj.group_id}`)
          );

          return {
            ...previous,

            groupname: [...filteredGroup],
          }
        })
      }
    }

    if (e.target.name == "groupname") {
      if (e.target.id == "selectAll") {
        const allselectedGroupName = selectAllCheckedGroupName ? [] : filterOptions?.groupname.map(option => option.split('_')[option.split('_').length - 1])
        setSelectedOptions((previous) => ({
          ...previous,
          groupname: allselectedGroupName,
        }));


      } else {
        updatedGroup = selectedOptions.groupname.includes(e.target.value)
          ? selectedOptions.groupname.filter(
            (group) => group !== e.target.value
          )
          : [...selectedOptions.groupname, e.target.value];

        setSelectedOptions((previous) => ({
          ...previous,
          groupname: updatedGroup,
        }));
      }
    }
  };


  const getSpanData = () => {

    setNotifyData({ ...NotifyData, loadingFlag: true, loadingMsg: 'Loading Limit Data' })



    let inrData = position.filter(val => val.basecurrency == 'INR');
    let filteredPosition = [];
    filteredPosition = inrData?.filter((obj) =>

      (selectedOptions?.exchange.length === 0 ||
        selectedOptions?.exchange?.some((selectedExchange) =>
          obj.exchange_id.toString().includes(selectedExchange.toString())
        )) &&
      (selectedOptions?.cluster.length === 0 ||
        selectedOptions?.cluster?.some((selectedCluster) =>
          obj.cluster_id.toString().includes(selectedCluster.toString())
        )) &&
      (selectedOptions?.groupname.length === 0 ||
        selectedOptions?.groupname?.some((selectedGroup) =>
          obj.group_id.toString().includes(selectedGroup.toString())
        ))

    );

    let apis = [GET_NETPOSITION_API({ event: "span_expo_calc", data: { wise: 'userid', position: filteredPosition } }), GET_MARGIN_CONFIG_API()]
    const apiData = Promise.all(apis)
    apiData.then(res => {
      setNotifyData({ ...NotifyData, loadingFlag: false })
      const [span, margin] = res



      if (margin.status == 200 && span.status == 200) {
        let margins = {};
        for (let key in span.data.result) {
          let dt = { userid: key, margin: span.data.result[key].margin, allowed: 0, remaining: 0 }
          margins[key] = dt
        }

        margin.data.result.forEach((val) => {
          if (val.margintype == 'CR' && margins[val.userid]) {
            margins[val.userid].allowed += val.allowed
          }
        })

        for (let key in margins) {
          margins[key].remaining = margins[key].allowed - margins[key].margin
        }

        setLimitTableData(Object.values(margins))
      }
    }).catch(err => {
      setNotifyData({ ...NotifyData, loadingFlag: false, errorFlag: true, errorMsg: err?.data?.response })
    })
    // const getSpan = new Promise((resolve, reject) => {
    //   resolve(GET_NETPOSITION_API({ event: "span_expo_calc", data: { wise: 'userid', position: filteredPosition } }))
    // })
    // getSpan.then(res => {
    //   const { result } = res.data
    //   let temp = []
    //   for (let key in result) {

    //     let dt = { userid: key, margin: result[key].margin }
    //     temp.push(dt)
    //   }
    //   setLimitTableData(temp)
    // }).catch(err => {
    //   console.log(err);
    // })
  }



  return (
    <div className={`${altStyle.alertTableSection} alertTableSection`} >
      <div
        className={altStyle.optionCheckBoxSection}

      >
        <div className="dashSelect" >
          <Dropdown className={`${altStyle.exchangeSelection} dashSelect`} >
            <Dropdown.Toggle
              className={`${altStyle.selectContent} selectContent`}
              id="currency"
            >
              Currency
              {selectedOptions.currency?.map(elem => ` ${elem}`)}
            </Dropdown.Toggle>

            <Dropdown.Menu className={altStyle.dropdownOption} >
              {filterOptions?.currency?.map((option) => (
                <Form.Check
                  className={altStyle.formCheck}
                  name="currency"
                  key={option}
                  type="checkbox"
                  label={option}
                  id={option}
                  value={option}
                  checked={selectedOptions.currency.includes(option)}
                  onChange={handleCheckboxChange}
                />
              ))}

            </Dropdown.Menu>
          </Dropdown>

        </div>
        <div className="dashSelect">
          <Dropdown className={`${altStyle.exchangeSelection} dashSelect`}>
            <Dropdown.Toggle
              className={`${altStyle.selectContent} selectContent`}
              id="exchange"
            >
              Exchange
              {/* {selectedOptions.exchange?.map(elem => ` ${elem}`)} */}
            </Dropdown.Toggle>

            <Dropdown.Menu className={altStyle.dropdownOption} >
              {filterOptions?.exchange?.map((option) => (
                <Form.Check
                  className={altStyle.formCheck}
                  name="exchange"
                  key={option}
                  type="checkbox"
                  label={option.split('_')[0]}
                  id={option}
                  value={option.split('_')[1]}
                  checked={selectedOptions.exchange.includes(option.split('_')[1])}
                  onChange={handleCheckboxChange}
                />
              ))}
              {/* <Form.Select
                  onChange={handleCheckboxChange}
                  name={"exchange"}
                  size="sm"
                >
                  {filterOptions?.exchange?.map((val) => (
                    <option value={val}>{val}</option>
                  ))}
                </Form.Select> */}
            </Dropdown.Menu>
          </Dropdown>
          {/* <Form.Select
              onChange={handleCheckboxChange}
              name="exchange"
              className={tableStyle.selectForm}
            >
              <option value="exchnage" hidden>
                exchnage
              </option>
              {filterOptions?.exchange?.map((val) => (
                <option value={val}>{val}</option>
              ))}
            </Form.Select> */}
        </div>
        <div className="dashSelect">
          <Dropdown className={`${altStyle.exchangeSelection} dashSelect`} >
            <Dropdown.Toggle
              className={`${altStyle.selectContent} selectContent`}
              id="cluster"
            >
              Cluster
            </Dropdown.Toggle>

            <Dropdown.Menu className={altStyle.dropdownOption} >
              <Form.Check
                className={altStyle.formCheck}
                name="cluster"
                type="checkbox"
                label="Select All"
                id="selectAll"
                value="selectAll"
                checked={selectAllCheckedcluster}
                onChange={handleCheckboxChange}
              />
              {filterOptions?.cluster?.map((option) => (
                <Form.Check
                  className={altStyle.formCheck}
                  name="cluster"
                  key={option}
                  type="checkbox"
                  label={option.split('_')[0]}
                  id={option}
                  value={option.split('_')[1]}
                  checked={selectedOptions.cluster.includes(option.split('_')[1])}
                  onChange={handleCheckboxChange}
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="dashSelect">
          <Dropdown className={`${altStyle.exchangeSelection} dashSelect`}>
            <Dropdown.Toggle
              className={`${altStyle.selectContent} selectContent`}
              id="groupname"
            >
              Group
            </Dropdown.Toggle>

            <Dropdown.Menu className={altStyle.dropdownOption} >
              <Form.Check
                className={altStyle.formCheck}
                name="groupname"
                type="checkbox"
                label="Select All"
                id="selectAll"
                value="selectAll"
                checked={selectAllCheckedGroupName}
                onChange={handleCheckboxChange}
              />
              {filterOptions?.groupname?.map((option) => (
                <Form.Check
                  className={altStyle.formCheck}
                  name="groupname"
                  key={option}
                  type="checkbox"
                  label={option.split('_').slice(0, -1).join('_')}
                  id={option}
                  value={option.split('_')[option.split('_')?.length - 1]}
                  checked={selectedOptions?.groupname?.includes(option.split('_')[option.split('_')?.length - 1])}
                  onChange={handleCheckboxChange}
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className={`${altStyle.expandBtn} dashCardSubBtn`} >
          <button onClick={() => {
            runCreateData()
            getSpanData()
          }}>
            <IoEnter />
          </button>
        </div>
      </div>
      {/* <div className={tableStyle.popupTableHeader}></div> */}
      {curruncyWiseTables == "USD" && <div style={{ height: "100%" }}>
        <div className="row" style={{ height: "100%" }}>

          <div className="col-md-6" >
            <SymbolTable
              heading={"symbolwise"}
              data={symbolWiseTable}
            />
          </div>
          <div className={'col-md-6'}>

            {/* <SymbolTable heading={"useridwise"} data={limitTableData} /> */}
            <SymbolTable heading={"useridwise"} data={useridWiseTable} />
          </div>
        </div>
      </div>}
      {curruncyWiseTables == "INR" && <div style={{ height: "100%" }}>
        <div className="row" style={{ height: "100%" }}>

          {/* <div className="col-md-6" >
            <SymbolTable
              heading={"symbolwise"}
              data={symbolWiseTable}
            />
          </div> */}
          <div className={'col-md-12'}>

            <SymbolTable heading={"useridwise"} data={limitTableData} total={true} />
            {/* <SymbolTable heading={"useridwise"} data={useridWiseTable} /> */}
          </div>
        </div>
      </div>}

      <div>
        <Notification
          notify={NotifyData}
          CloseError={CloseError}
          CloseSuccess={CloseSuccess}
        />
      </div>
    </div>
  );
};

export default SymbWiseLimitTable;
