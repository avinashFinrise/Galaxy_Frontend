import { useState, useRef, memo, useEffect } from "react";
import { Form, Row, Col, InputGroup } from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import { MdGroup } from "react-icons/md";
import { CREATE_GROUP_API } from "../../../API/ApiServices";
import { Notification } from "../../DynamicComp/Notification";
import useApi from "../../CustomHook/useApi";
import profile from "../ProfilePage/ProfilePage.module.scss";

const CreateGroup = (props) => {
  const { data, loading, error, makeApiCall } = useApi(CREATE_GROUP_API);

  const [nameErrorMessage, setNameErrorMessage] = useState("Enter Group Name");
  // const [sharingErrorMessage, setSharingErrorMessage] = useState("Enter Exchange Name");
  // const [parentIdErrorMessage, setParentIdErrorMessage] = useState("Enter Exchange Name");
  const [addGroupDetails, setAddGroupDetails] = useState({
    event: "create",
    data: {
      groupName: "",
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

  const [validated, setValidated] = useState(false);
  const nameRef = useRef("");

  const CloseConfirm = () => {
    setNotifyData((data) => ({ ...data, confirmFlag: false }));
  };

  const CloseError = () => {
    setNotifyData((data) => ({ ...data, errorFlag: false }));
  };
  const CloseSuccess = () => {
    setNotifyData((data) => ({ ...data, successFlag: false }));
  };
  // const handleSubmit = (event) => {
  //   const form = event.currentTarget;
  //   if (form.checkValidity() === false) {
  //     event.preventDefault();
  //     event.stopPropagation();
  //   }
  //   setValidated(true);
  // };

  useEffect(() => {
    if (loading) {
      setNotifyData((data) => ({
        ...data,
        loadingFlag: true,
        loadingMsg: "Creating group...",
      }));
    }
    // console.log(data);
    if (data?.status === "success") {
      setNotifyData((prev) => {
        return {
          ...prev,
          loadingFlag: false,
          confirmFlag: false,
          successFlag: true,
          successMsg: data.status,
        };
      });
    } else if (error) {
      console.log(error);
      setNotifyData((prev) => {
        return {
          ...prev,
          loadingFlag: false,
          confirmFlag: false,
          errorFlag: true,
          errorMsg: error.response?.data.reason,
          headerMsg: error.code,
        };
      });
    }
  }, [data, error, loading]);

  const onAddGroup = async (e) => {
    e.preventDefault();
    if (nameRef.current.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      setNotifyData((data) => ({ ...data, confirmFlag: false }));
    } else {
      makeApiCall(CREATE_GROUP_API, addGroupDetails);
    }
    setValidated(true);
  };
  const handleGroupInput = (e) => {
    setAddGroupDetails((prev) => ({
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
          <MdGroup />
        </span>
        Create Group
      </h5>
      <Form
        // noValidate
        ref={nameRef}
        validated={validated}
        onSubmit={onAddGroup}
        className={profile.basicInfoSetting}
      >
        <Row className="">
          <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <FaUser />
              </span>
              Name
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                type="text"
                placeholder="Enter Group Name"
                // pattern="[^\s]+"
                // onChange={handleErrorMessage}
                name="groupName"
                onChange={handleGroupInput}
                value={addGroupDetails.data.groupName}
                ref={nameRef}
                required
              />
              <Form.Control.Feedback type="invalid">
                {nameErrorMessage}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <div className={`col-md-6 mb-3  ${profile.createGroupBtn}`}>
            {/* <label htmlFor=""></label> */}
            <input
              type="submit"
              className={`basic-InfoBtn ${profile.basicInfoBtn}`}
              value="Create"
              // onClick={onAddGroup}
              onClick={(e) => {
                e.preventDefault();
                setNotifyData((data) => ({
                  ...data,
                  confirmFlag: true,
                  confirmMsg: "Are you sure, You want to create group name ?",
                  confirmAction: (e) =>
                    onAddGroup(e)
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
          View Group
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

export default memo(CreateGroup);
