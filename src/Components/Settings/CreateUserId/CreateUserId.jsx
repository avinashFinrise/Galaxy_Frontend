import { useState, useRef, memo } from "react";
import { Form, Row, Col, InputGroup } from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import { CREATE_USERID_MASTER } from "../../../API/ApiServices";
import { Notification } from "../../DynamicComp/Notification";
import profile from "../ProfilePage/ProfilePage.module.scss";

const CreateUserId = (props) => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [addUserid, setAddUserid] = useState({
    event: "create",
    data: {
      userId: "",
      sender: "",
    },
  });
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
  const CloseConfirm = () => {
    setNotifyData((data) => ({ ...data, confirmFlag: false }));
  };

  const crateUserId = async (e) => {
    e.preventDefault();
    if (formRef.current.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      setNotifyData((data) => ({ ...data, confirmFlag: false }));
    } else {
      setNotifyData((prev) => ({
        ...prev,
        loadingFlag: true,
        loadingMsg: "Creating userid...",
      }));
      const userIdData = new Promise((resolve, reject) => {
        resolve(CREATE_USERID_MASTER(addUserid));
      });
      userIdData
        .then((res) => {
          // console.log(res);
          if (res.status === 200) {
            setNotifyData((prev) => {
              return {
                ...prev,
                loadingFlag: false,
                successFlag: true,
                confirmFlag: false,
                successMsg: "Success",
              };
            });
          }
        })
        .catch((err) => {
          console.log(err);
          setNotifyData((prev) => {
            return {
              ...prev,
              loadingFlag: false,
              errorFlag: true,
              confirmFlag: false,
              errorMsg: err.response?.data.reason,
            };
          });
        });
    }
    setValidated(true);
  };

  const handleClusterInput = (e) => {
    setAddUserid((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [e.target.name]: e.target.value,
      },
    }));
  };
  return (
    <div className={`basic-forminfo ${profile.basicInfo}`}>
      <h5 className={profile.basicHeading}>
        <span className={profile.icons}>
          <FaUser />
        </span>
        Create UserId
      </h5>
      <Form
        ref={formRef}
        validated={validated}
        onSubmit={crateUserId}
        className={profile.basicInfoSetting}
      >
        <Row className="">
          <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <FaUser />
              </span>
              UserId Name
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                type="text"
                placeholder="Enter userid name"
                pattern="[^\s]+"
                name="userId"
                onChange={handleClusterInput}
                value={addUserid.data.userId}
                required
              />
              <Form.Control.Feedback type="invalid">
                Enter UserId name
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <FaUser />
              </span>
              Sender name
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                type="text"
                placeholder="Enter sender name"
                pattern="[^\s]+"
                name="sender"
                onChange={handleClusterInput}
                value={addUserid.data.sender}
                required
              />
              <Form.Control.Feedback type="invalid">
                Enter sender name
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <div className="col-md-12 mb-3 mt-3" >
            {/* <label htmlFor=""></label> */}
            <input
              type="submit"
              className={`basic-InfoBtn ${profile.basicInfoBtn}`}
              value="Create"
              // onClick={crateUserId}
              onClick={(e) => {
                e.preventDefault();
                setNotifyData((data) => ({
                  ...data,
                  confirmFlag: true,
                  confirmMsg: "Are you sure, You want to create userId ?",
                  confirmAction: (e) =>
                    crateUserId(e)
                }))
              }}
            />
          </div>
        </Row>
        <h6
          onClick={() => props.toggleVisibility()}
          className={profile.hideShowtoggle}
        >
          {props.visibility ? "Hide " : "Show "}
          UserId
        </h6>
      </Form>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
        CloseConfirm={CloseConfirm}
      />
    </div>
  );
};

export default memo(CreateUserId);
