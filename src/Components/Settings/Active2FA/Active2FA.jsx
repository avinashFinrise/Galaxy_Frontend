import { memo, useState } from "react";
import active from "./Active2FA.module.scss";
import { FaPaperPlane, FaQrcode, FaUnlock } from "react-icons/fa";
import { Collapse, Form, InputGroup } from "react-bootstrap";
import telegrambar from "../../../assets/Img/cosmic-chatbot.png";
import { Notification } from "../../DynamicComp/Notification";
import { UpdateTelegramID_API, VerifyOTP_API } from "../../../API/ApiServices";

const Active2FA = () => {
  const [telegram, setTelegram] = useState(false);
  const [qrCode, setqrCode] = useState(true);
  const [otp, setOtp] = useState(false);

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

  const [formData, setTelegramId] = useState(
    {
      telegramid: "",
      otp: ""
    });


  const CloseError = () => {
    setNotifyData((data) => ({ ...data, errorFlag: false }));
  };
  const CloseSuccess = () => {
    setNotifyData((data) => ({ ...data, successFlag: false }));
  };
  const CloseConfirm = () => {
    setNotifyData((data) => ({ ...data, confirmFlag: false }));
  };
  const activeData = [
    { icon: <FaQrcode />, content: "Step 1: Scan QR code", id: "qrcode" },
    {
      icon: <FaPaperPlane />,
      content: "Step 2: Enter your telegram chat Id",
      id: "telegram",
    },
    { icon: <FaUnlock />, content: "Step 3: Enter OTP", id: "otp" },
  ];


  const addTelegramId = async (e) => {
    e.preventDefault();

    setNotifyData((prev) => ({ ...prev, loadingFlag: true, loadingMsg: "Please Wait...", }));

    try {
      const { data } = await UpdateTelegramID_API({ telegramid: formData.telegramid })
      setNotifyData((prev) => ({ ...prev, loadingFlag: false, successFlag: true, confirmFlag: false, successMsg: "Success", }))
      handleClick(2)

    } catch (err) {
      setNotifyData((prev) => ({ ...prev, loadingFlag: false, errorFlag: true, confirmFlag: false, errorMsg: err.response?.data.reason.userId, }))
    }
  };

  const activateTelegram = async (e) => {
    e.preventDefault();

    setNotifyData((prev) => ({ ...prev, loadingFlag: true, loadingMsg: "Please Wait...", }));

    try {
      const { data } = await VerifyOTP_API(formData)

      setNotifyData((prev) => ({ ...prev, loadingFlag: false, successFlag: true, confirmFlag: false, successMsg: "Success" }));

    } catch (err) {
      console.log(err);
      setNotifyData((prev) => ({ ...prev, loadingFlag: false, errorFlag: true, confirmFlag: false, errorMsg: err.response?.data.reason }))
    }
  }

  const handleClick = (val) => {
    if (val === 0) {
      setqrCode(true);
      setTelegram(false);
      setOtp(false);
    } else if (val === 1) {
      setqrCode(false);
      setTelegram(true);
      setOtp(false);
    } else {
      setqrCode(false);
      setTelegram(false);
      setOtp(true);
    }
  };



  return (
    <div className={`active-page-section ${active.activePage}`}>
      <h6 className={active.track}>Activate 2 Factor Authentication</h6>
      <div className={`row ${active.Section2faContent}`}>
        <div className={`col-md-6 ${active.trackingSection}`}>
          {activeData.map((data, i) => {
            return (
              <div
                key={i}
                className={active.trakingSingleItem}
                onClick={() => handleClick(i)}
                id={data.id}
              >
                <div className={active.itemIcon}>
                  <span className={active.icon}>{data.icon}</span>
                </div>
                <div className={active.contentSection}>
                  <span className={active.content}>{data.content}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className={`col-md-6 ${active.factorSection}`}>
          <Collapse in={qrCode}>
            <div className={active.qrcode}>
              <div className={active.qrcodeSpace}>
                {/* <QRCode value="https://t.me/Cosmicrms_bot" /> */}
                <img src={telegrambar} alt="telegrambar" />
              </div>
              <h5 className={active.qrHeading}>
                NOTE : Scan above QR code then start the bot  ( i.e
                cosmicrms_bot)
              </h5>
              <h6 className={active.nextbtn}>
                <button onClick={() => handleClick(1)}>next</button>
              </h6>
            </div>
          </Collapse>
          <Collapse in={telegram}>
            <div >
              <Form className={active.telegramInput}>
                <InputGroup className={active.formFroup}>
                  <Form.Control
                    type="text"
                    value={formData.telegramid}
                    onChange={(e) =>
                      setTelegramId({
                        ...formData,
                        telegramid: e.target.value,
                      })
                    }
                    placeholder="Enter telegram chat id"
                    required
                  />
                </InputGroup>
                <div>
                  <input
                    type="submit"
                    className={active.telegrambtn}
                    value="Add"
                    onClick={addTelegramId}
                  />
                </div>
              </Form>
              <h5 className={active.qrHeading}>
                NOTE : Before entring telegram chatid, Make sure you have
                started cosmicrms_bot !
              </h5>
              {/* <h6 className={active.nextbtn}>
                                <button onClick={() => handleClick(2)}>next</button>
                            </h6> */}
            </div>
          </Collapse>
          <Collapse in={otp}>
            <div>
              <Form className={active.telegramInput}>
                <InputGroup className={active.formFroup}>
                  <Form.Control
                    type="text"
                    value={formData.otp}
                    onChange={(e) =>
                      setTelegramId({ ...formData, otp: e.target.value })
                    }
                    placeholder="Enter your OTP"
                    required
                  />
                </InputGroup>
                <div>
                  <input
                    type="submit"
                    className={active.otpbtn}
                    value="activate"
                    onClick={activateTelegram}
                  />
                </div>
              </Form>
            </div>
          </Collapse>
        </div>
      </div>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
        CloseConfirm={CloseConfirm}
      />
    </div>
  );
};

export default memo(Active2FA)
