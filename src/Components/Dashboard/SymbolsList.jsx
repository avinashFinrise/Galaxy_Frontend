import { useEffect, useState } from 'react'
import dstyle from "../DynamicComp/DynamicCom.module.scss";
// import { Checkbox, Divider } from 'antd';
import { Form } from "react-bootstrap";
import { GET_COMPONENTSETTING_API, POST_COMPONENTSETTING_API } from '../../API/ApiServices';
import { Notification } from '../DynamicComp/Notification';
// const CheckboxGroup = Checkbox.Group;
// const defaultCheckedList = [];


const componentInfo = { componentname: "selectedSymbolsInPriceCard", componenttype: "selectedSymbolsInPriceCard" }

export const SymbolsList = ({ allSymbols, componentName, positonProductSetting, selectSymbolsFunction, settings }) => {
  const [updatedOptions, setUpdatedOptions] = useState({
    [componentName]: settings?.setting[componentName] ? settings?.setting[componentName] : []
  })

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



  useEffect(() => {
    setNotifyData({ ...NotifyData, loadingFlag: true, loadingMsg: 'Fetching Symbols' })
    const componentSetting = new Promise((resolve, reject) => {
      resolve(GET_COMPONENTSETTING_API(componentInfo))
    })
    componentSetting.then(res => {
      setNotifyData({ ...NotifyData, loadingFlag: false })
      if (res.data.result?.[componentInfo.componentname]?.setting[componentName]) {
        setUpdatedOptions({
          [componentName]: res.data.result?.[componentInfo.componentname]?.setting[componentName]
        })
      }
    }).catch(err => {
      setNotifyData({ ...NotifyData, loadingFlag: false, errorFlag: true, errorMsg: err?.response })
      console.log(err);
    })


  }, [])

  // const [checkedList, setCheckedList] = useState(defaultCheckedList);
  // const checkAll = symbols.length === checkedList.length;
  // const indeterminate = checkedList.length > 0 && checkedList.length < symbols.length;

  const handleCheckboxChange = (e) => {
    const { name, value } = e.target;


    // const updatedOptions = { ...selectedSymbolsAndExchange };
    setUpdatedOptions(prev => ({
      ...prev,
      [componentName]: prev?.[componentName]?.includes(value) ? prev?.[componentName]?.filter(
        (symbol) => symbol !== value
      ) : [...prev?.[componentName], value]
    }))
  }




  const handleSave = async () => {
    let selectedSymbols = updatedOptions[componentName].filter(e => allSymbols.some(val => val.sym = e));
    selectSymbolsFunction(selectedSymbols)
    const componentSettingPost = await POST_COMPONENTSETTING_API({
      event:
        settings?.id ? 'update' : 'create',
      // componentSettingfetchid !== undefined || null ? "update" : "create",

      data: {
        ...(settings?.id && { id: settings?.id }),
        ...componentInfo,

        setting: { ...updatedOptions, [componentName]: selectedSymbols },
      },
    })
    positonProductSetting()
  }
  const handleSelectAll = (e) => {
    const { checked } = e.target
    if (checked) {
      setUpdatedOptions(prev => ({
        ...prev,
        [componentName]: allSymbols.map(e => e.sym)
      }))
    } else {
      setUpdatedOptions(prev => ({
        ...prev,
        [componentName]: []
      }))
    }
  }
  // const onChange = (list) => {
  //   setCheckedList(list);
  // };

  // const onCheckAllChange = (e) => {
  //   console.log(e.target.checked, symbols);
  //   setCheckedList(e.target.checked ? symbols.map(e => e.value) : []);
  // };
  return (

    <div className={dstyle.exchFilterSection}>
      <div className="row">
        <Form.Group className='mb-3 col-md-12  col-12'>
          <Form.Check
            type="checkbox"
            label={'Select All'}
            name="symbol"
            id={'selectAll'}
            value={'selectAll'}
            checked={allSymbols?.length == updatedOptions[componentName]?.length}
            onChange={handleSelectAll}

          // onChange={(e) => props.handleUserPermision(e)}
          // checked={props.data.permissions.isdashboard}
          />
        </Form.Group>
        {allSymbols?.map((item, i) => {
          return (
            <>

              <Form.Group className="mb-3 col-md-3  col-12">
                <Form.Check
                  type="checkbox"
                  label={item.sym}
                  name="symbol"
                  id={item.sym}
                  value={item.sym}
                  checked={updatedOptions?.[componentName]?.includes(
                    item.sym
                  )}
                  onChange={handleCheckboxChange}
                // onChange={(e) => props.handleUserPermision(e)}
                // checked={props.data.permissions.isdashboard}
                />
              </Form.Group>
            </>
          );
        })}
        {/* <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
        Check all
      </Checkbox>
      <Divider />
      <CheckboxGroup options={symbols.map(e=>e.value)} value={checkedList} onChange={onChange} /> */}

      </div>
      <div className={dstyle.btnSection}>
        <button onClick={handleSave}>save</button>
      </div>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      />
    </div>

  )
}


