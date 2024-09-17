import { Modal } from "react-bootstrap";

const ModalPopup = (props) => {
  return (
    <Modal
      show={props.flag}
      onHide={props.close}
      size={props.size}
      // backdrop="static"
      // keyboard={false}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      fullscreen={props.fullscreen}
      className={`mtmSymbolWisePop ${props.className}`}
    >
      <Modal.Header closeButton>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.component}</Modal.Body>
    </Modal>
  );
};

export default ModalPopup;
