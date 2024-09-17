import { useState, useRef, memo, useEffect } from "react";
import { Form, Row, Col, InputGroup } from "react-bootstrap";
import { AiOutlineCluster } from "react-icons/ai";
import { CREATE_CLUSTER_API } from "../../../API/ApiServices";
import { Notification } from "../../DynamicComp/Notification";
import useApi from "../../CustomHook/useApi";
import profile from "../ProfilePage/ProfilePage.module.scss";

const CreateCluster = (props) => {
  const [nameErrorMessage, setNameErrorMessage] =
    useState("Enter cluster Name");
  const [addCluster, setAddCluster] = useState({
    event: "create",
    data: {
      clustername: "",
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
  const { data, loading, error, makeApiCall } = useApi(CREATE_CLUSTER_API);
  useEffect(() => {
    if (loading) {
      setNotifyData((data) => ({
        ...data,
        loadingFlag: true,
        loadingMsg: "Creating cluster name...",
      }));
    }
    if (data?.httpstatus === 200) {
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

  const onCreateCluster = async (e) => {
    e.preventDefault();
    if (nameRef.current.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      setNotifyData((data) => ({ ...data, confirmFlag: false }));
    } else {
      makeApiCall(CREATE_CLUSTER_API, addCluster);
    }
    setValidated(true);
  };

  const handleClusterInput = (e) => {
    setAddCluster((prev) => ({
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
          <AiOutlineCluster />
        </span>
        Create Cluster
      </h5>
      <Form
        ref={nameRef}
        validated={validated}
        onSubmit={onCreateCluster}
        className={profile.basicInfoSetting}
      >
        <Row className="">
          <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <AiOutlineCluster />
              </span>
              Cluster
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                type="text"
                placeholder="Enter Cluster"
                pattern="[^\s]+"
                name="clustername"
                // onChange={handleErrorMessage}
                onChange={handleClusterInput}
                value={addCluster.data.clustername}
                ref={nameRef}
                required
              />
              <Form.Control.Feedback type="invalid">
                {nameErrorMessage}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <div className={`col-md-6 mb-3 ${profile.createGroupBtn}`}>
            {/* <label htmlFor=""></label> */}
            <input
              type="submit"
              className={`basic-InfoBtn ${profile.basicInfoBtn}`}
              value="Create"
              // onClick={onCreateCluster}
              onClick={(e) => {
                e.preventDefault();
                setNotifyData((data) => ({
                  ...data,
                  confirmFlag: true,
                  confirmMsg: "Are you sure, You want to create cluster ?",
                  confirmAction: (e) =>
                    onCreateCluster(e)
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
          Cluser data
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

export default memo(CreateCluster);
