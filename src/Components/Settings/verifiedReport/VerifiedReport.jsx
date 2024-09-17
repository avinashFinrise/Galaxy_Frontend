import { Form, Row, Col, InputGroup } from "react-bootstrap";
import profile from "../ProfilePage/ProfilePage.module.scss";
import { DatePicker } from "antd";
import { BsCalendar2EventFill, BsCurrencyExchange } from "react-icons/bs";
import { useEffect, useState } from "react";
import { GET_EXCHANGE_API, GET_USER_SETTINGS_API, UPLOAD_VERIFIED_API } from "../../../API/ApiServices";
import { Notification } from "../../DynamicComp/Notification";
import VerifiedReportsTable from "./components/VerifiedReportsTable";
import { FaFileCircleCheck } from "react-icons/fa6";


function VerifiedReport() {
    const [data, setData] = useState([])
    const [userdate, setUserDate] = useState()
    const [formData, setFormData] = useState({ exchange: "NSE", date: "" })
    const [tolerance, setTolerance] = useState(0)
    const [exchangeOptions, setExchangeOptions] = useState([])
    const [file, setFile] = useState()


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
    const CloseError = () => setNotifyData((data) => ({ ...data, errorFlag: false }));
    const CloseSuccess = () => setNotifyData((data) => ({ ...data, successFlag: false }));
    const CloseConfirm = () => {
        setNotifyData((data) => ({ ...data, confirmFlag: false }));
    };

    useEffect(() => {
        (async () => {
            try {
                const { data } = await GET_USER_SETTINGS_API()
                const exchange = await GET_EXCHANGE_API()
                setExchangeOptions(exchange.data.result)
                setUserDate(data.result[0].date_range.fromdate)
            } catch (error) {
                console.log({ error })
            }
        })()
    }, [])

    const handleChange = (e, option) => {
        let name = null
        let value = null
        if (e) {
            name = e.target.name
            value = e.target.value
        } else {
            name = option.n;
            value = option.v;
        }

        setFormData(p => ({ ...p, [name]: value }))
    }

    const handleFIle = (e) => {
        setFile(e.target.files?.[0])
    }

    const verify = async (e) => {
        if (!data?.length > 0) return
        e.preventDefault()
        console.log({ formData });
        try {
            // const form = new FormData()
            // form.append("data", JSON.stringify(data))
            // form.append("event", "verified")
            const res = await UPLOAD_VERIFIED_API({ event: "verified", data, "tolerance": +(tolerance), ...formData })
            setNotifyData((prev) => ({ ...prev, confirmFlag: false, loadingFlag: false, successFlag: true, successMsg: res.data?.result }));
            setData([])
            setFormData({ date: '', exchange: '' })
            setTolerance(0)
            // if (data.result?.length < 1) setNotifyData((prev) => ({ ...prev, loadingFlag: false, errorFlag: true, errorMsg: "No data found" }));
            // setData(res.data.result)
        } catch (err) {
            console.log(err)
            setNotifyData((prev) => ({ ...prev, confirmFlag: false, loadingFlag: false, errorFlag: true, errorMsg: err.response?.data.reason, headerMsg: err.code, }));
        }
    }

    const onSubmit = async (e) => {
        setNotifyData((prev) => ({ ...prev, loadingFlag: true, }));
        e.preventDefault()
        try {
            const form = new FormData()
            form.append("date", formData.date)
            form.append("file", file)
            form.append("exchange", formData.exchange)
            form.append("event", "uploadfile")
            const { data } = await UPLOAD_VERIFIED_API(form)
            if (data.result?.length < 1) setNotifyData((prev) => ({ ...prev, loadingFlag: false, errorFlag: true, errorMsg: "No data found" }));
            setData(data.result)
        } catch (err) {
            console.log(err)
            setNotifyData((prev) => ({ ...prev, loadingFlag: false, errorFlag: true, errorMsg: err.response?.data.reason, headerMsg: err.code, }));
        }
        setNotifyData((prev) => ({ ...prev, loadingFlag: false, errorFlag: false, }));

    }

    // console.log(formData)

    return (
        <>
            <div className={`basic-forminfo ${profile.basicInfo}`}>
                <Form
                    onSubmit={handleChange}
                    className={`${profile.basicInfoSetting} ${profile.headingSection}`}
                >
                    <Row className={profile.contantSection}
                    // style={{ width: "100%" }}
                    >
                        <div className="col-md-5">
                            <h5 className={profile.basicHeading}>
                                <span className={profile.icons}>
                                    <FaFileCircleCheck />
                                </span>
                                Verify Report
                            </h5>
                        </div>
                        {data?.length > 0 ? null : (
                            <>
                                <Form.Group
                                    as={Col}
                                    md="2"
                                    className={`${profile.rmsDateSection} ${profile.historySingleItem}`}
                                >
                                    <Form.Label className={profile.moblabel}>
                                        <span className={`label-icon ${profile.labelIcon}`}>
                                            <BsCalendar2EventFill />
                                        </span>
                                        Date
                                        <span className={profile.mendatory}>*</span>
                                    </Form.Label>
                                    <InputGroup hasValidation>
                                        <DatePicker
                                            onChange={(date, s) => handleChange(null, { n: "date", v: s })}
                                            format="YYYY-MM-DD"
                                            placeholder={"Date"}
                                            allowClear
                                            className={profile.datePicker}
                                            // disabledDate={(current) => current.isAfter(userdate, "day")}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">select date</Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group as={Col} md="2" className={`${profile.rmsDataExchange} ${profile.historySingleItem}`}>
                                    <Form.Label className={profile.moblabel}>
                                        <span className={`label-icon ${profile.labelIcon}`}>
                                            <BsCurrencyExchange />
                                        </span>
                                        Exchange
                                        <span className={profile.mendatory}>*</span>
                                    </Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Select
                                            name="exchange"
                                            value={formData.exchange}
                                            onChange={handleChange}
                                            aria-label="Floating label select example"
                                            required
                                        >
                                            <option value="" hidden>
                                                Select Exchange
                                            </option>
                                            {exchangeOptions.map(e => <option>{e.exchange}</option>)}

                                            {/* {spanExchangeList?.map((val) => {
                                    return (
                                        <option key={val.id} value={val.id}>
                                        {val.exchange}
                                        </option>
                                    );
                                    })} */}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            Please Select Exchange.
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group as={Col} md="2" className={profile.historySingleItem}>
                                    <InputGroup hasValidation>
                                        <Form.Control type="file" onChange={handleFIle} required />
                                        <Form.Control.Feedback type="invalid">
                                            Select File
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>


                            </>
                        )}

                        <div className={`col-md-1 ${data?.length > 0 ? profile.customstyle : ''}`} >
                            {data.length > 0 && <Form.Group as={Col} md="2" className={profile.historySingleItem}>
                                <InputGroup hasValidation>
                                    <Form.Control hasValidation
                                        type="number"
                                        name="tolerance"
                                        value={tolerance}
                                        onChange={(e) => setTolerance(e.target.value)}
                                        required
                                    />
                                </InputGroup>
                            </Form.Group>}
                            <input
                                type="submit"
                                className={`basic-InfoBtn ${profile.basicInfoBtn}`}
                                value={data?.length > 0 ? "Verify" : "Upload"}
                                onClick={data?.length > 0 ? verify : onSubmit}
                            />
                        </div>
                    </Row>
                </Form>
                {data?.length > 0 && <VerifiedReportsTable data={data} />}
            </div >
            <Notification CloseConfirm={CloseConfirm} notify={NotifyData} CloseError={CloseError} CloseSuccess={CloseSuccess} />
        </>
    )
}

export default VerifiedReport