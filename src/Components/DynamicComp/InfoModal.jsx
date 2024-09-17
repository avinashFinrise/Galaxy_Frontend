import { useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import useApi from "../CustomHook/useApi";
import { DELETE_SESSION_API } from "../../API/ApiServices";

const InfoModal = (props) => {
  console.log(props);
  const { data, error, loading, makeApiCall } = useApi();
  useEffect(() => {
    if (data?.httpstatus === 200) {
      props.onHide();
    }
  }, [data]);

  const deleteSession = () => {
    makeApiCall(DELETE_SESSION_API, {
      ...props.loginData,
      event: "deletesession",
    });
  };

  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {`${props.modalDetails.header.toUpperCase()}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.modalDetails.error}</Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
        <Button onClick={deleteSession}>Delete Session</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InfoModal;
