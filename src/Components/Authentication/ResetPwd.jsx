// import React, { useState, memo, useEffect } from 'react'
// import { Col, Form, Row } from 'react-bootstrap';
// import { NavLink, useNavigate } from 'react-router-dom';
// import authlogin from './Authentication.module.scss'
// import lock from '../../assets/Img/lock.png'
// import background from '../../assets/Img/background-pattern.svg'
// import mainlogo from '../../assets/Icon/cosmic-logo.png'
// import { FaUser } from "react-icons/fa";
// import { MdVpnLock } from 'react-icons/md';
// import useApi from '../CustomHook/useApi';
// import { CHANGE_PWD_API } from '../../API/ApiServices';
// import { Notification } from '../DynamicComp/Notification';

// function ResetPwd() {
//     const { data, loading, error, makeApiCall } = useApi(CHANGE_PWD_API)

//     const [resetPwd, setResetPwd] = useState({
//         event: "update_password",
//         data: {
//             current_password: '',
//             new_password: ''
//         }
//     })
//     const [NotifyData, setNotifyData] = useState({
//         successFlag: false,
//         successMsg: 'success msg',
//         errorFlag: false,
//         errorMsg: 'error msg',
//         loadingFlag: false,
//         loadingMsg: 'loading msg',
//         activesession: false
//     })


//     const CloseError = () => {
//         setNotifyData((data) => ({ ...data, errorFlag: false }))
//     }
//     const CloseSuccess = () => {
//         setNotifyData((data) => ({ ...data, successFlag: false }))
//     }

//     useEffect(() => {
//         if (loading) {
//             setNotifyData((data) => ({ ...data, loadingFlag: true, loadingMsg: "loading..." }))
//         }
//         if (data?.httpstatus === 200) {
//             setNotifyData(prev => { return { ...prev, loadingFlag: false, confirmFlag: false, successFlag: true, successMsg: data.result } })
//         } else if (error) {
//             console.log(error);
//             setNotifyData(prev => { return { ...prev, loadingFlag: false, confirmFlag: false, errorFlag: true, errorMsg: error.response?.data.reason } })

//         }

//     }, [data, error, loading])

//     const resetPassword = async (e) => {
//         e.preventDefault()
//         makeApiCall(CHANGE_PWD_API, resetPwd)
//     }
//     const handleUpadte = (e) => {
//         setResetPwd(prev => ({
//             ...prev,
//             data: {
//                 ...prev.data,
//                 [e.target.name]: e.target.value
//             }
//         }))
//     }


//     return (
//         <>
//             <div className={`container-fluid ${authlogin.authentication}`}>
//                 <Row className={authlogin.Loginpage}>
//                     <Col md={5} >
//                         <Row className={authlogin.loginFormSection}>
//                             <Col md={12}>
//                                 <NavLink to="/login" className={authlogin.logo}>
//                                     <img src={mainlogo} alt="mainlogo" className={authlogin.responsiveimg} />
//                                 </NavLink>
//                             </Col>
//                             <Col md={12}>
//                                 <div className={authlogin.LoginCard}>
//                                     <h3>Reset Password</h3>
//                                     <Form>
//                                         <Form.Group className="mb-4">
//                                             <Form.Label
//                                                 htmlFor="current_password"
//                                                 className="form-label"
//                                             >
//                                                 <FaUser className={authlogin.labelIcon} /> Current Password
//                                             </Form.Label>
//                                             <Form.Control
//                                                 type="text"
//                                                 className="form-control"
//                                                 name='current_password'
//                                                 placeholder="Enter Current Password"
//                                                 value={resetPwd.data.current_password}
//                                                 onChange={handleUpadte}
//                                             />
//                                         </Form.Group>
//                                         <Form.Group className="mb-4">
//                                             <Form.Label
//                                                 htmlFor="new_password"
//                                                 className="form-label"
//                                             >
//                                                 <FaUser className={authlogin.labelIcon} /> New Password
//                                             </Form.Label>
//                                             <Form.Control
//                                                 type="text"
//                                                 className="form-control"
//                                                 name='new_password'
//                                                 placeholder="Enter New Password"
//                                                 value={resetPwd.data.new_password}
//                                                 onChange={handleUpadte}
//                                             />
//                                         </Form.Group>

//                                         <Form.Group className={authlogin.customBtn}>
//                                             <Form.Control
//                                                 type='submit'
//                                                 value='Submit'
//                                                 className={authlogin.sigleCustomBtn}
//                                                 onClick={resetPassword}
//                                             />
//                                         </Form.Group>
//                                     </Form>
//                                 </div>
//                             </Col>
//                         </Row>
//                     </Col>
//                     <Col md={7}>
//                         <div className={authlogin.chatBackground}>
//                             <img className={authlogin.backimg} src={background} alt="" />
//                             <img className={authlogin.backimg2} src={lock} alt="" />
//                             <div className={authlogin.backcontent}>
//                                 <h4 className={authlogin.content}>Soft UI Design</h4>
//                             </div>
//                             <div className={authlogin.backPContent}>
//                                 <p>Just as it takes a company to sustain a product, it takes a community to sustain a protocol.</p>
//                             </div>
//                         </div>
//                     </Col>
//                 </Row>
//             </div>
//             <Notification
//                 notify={NotifyData}
//                 CloseError={CloseError}
//                 CloseSuccess={CloseSuccess}
//             />
//         </>
//     )
// }
// export default memo(ResetPwd)