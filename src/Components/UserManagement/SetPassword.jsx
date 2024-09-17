import { useState } from 'react'
import { Col, Form, Row } from 'react-bootstrap';
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs';
import { IoKeySharp } from 'react-icons/io5';
import profile from "../Settings/ProfilePage/ProfilePage.module.scss";
import { FaLock } from 'react-icons/fa';
import { Notification } from '../DynamicComp/Notification';
import { CHANGE_PWD_API } from '../../API/ApiServices';

const SetPassword = ({ data }) => {

    const [passwordMatchError, setPasswordMatchError] = useState(false);
    const [validated, setValidated] = useState(false);

    const [updatePwd, setUpdatePwd] = useState({
        event: "update_password",
        data: {
            id: data.id,
            new_password: '',
            confirm_password: '',
            new_pwdvisibilty: false,
            cnfpwdvisibilty: false,
        }
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
    const CloseConfirm = () => {
        setNotifyData((data) => ({ ...data, confirmFlag: false }));
    };

    const CloseError = () => {
        setNotifyData((data) => ({ ...data, errorFlag: false }));
    };
    const CloseSuccess = () => {
        setNotifyData((data) => ({ ...data, successFlag: false }));
    };

    const validatePassword = (password) => {
        // Your password validation criteria
        // For example, you can enforce a minimum length and certain character types
        const minLength = 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasDigit = /\d/.test(password);
        // const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
        const isValidPassword =
            password.length >= minLength && hasUppercase && hasLowercase && hasDigit;

        return isValidPassword;
    };
    const handleCreatePwdInput = (e) => {
        const { name, value } = e.target;
        const isPassword = name === "new_password";
        const isConfirmPassword = name === "confirm_password";
        if (isConfirmPassword) {
            // Check if the confirmation password matches the password
            setPasswordMatchError(value !== updatePwd.data.new_password);
        }
        if ((isPassword || isConfirmPassword) && !validatePassword(value)) {
            setUpdatePwd((prev) => ({
                ...prev,
                data: {
                    ...prev.data,
                    [e.target.name]: e.target.value,
                },
            }));
        } else {
            setUpdatePwd((prev) => ({
                ...prev,
                data: {
                    ...prev.data,
                    [e.target.name]: e.target.value,
                },
            }));
        }
    };

    const onHandleUpdatePwd = async (e) => {
        e.preventDefault();
        console.log(data);
        const isValidNewPassword = validatePassword(updatePwd.data.new_password);
        const isValidConfirmPassword = validatePassword(updatePwd.data.confirm_password);

        setValidated(true);
        if (isValidNewPassword && isValidConfirmPassword && !passwordMatchError) {
            setNotifyData((prev) => ({
                ...prev,
                loadingFlag: true,
                loadingMsg: "loading...",
            }));

            const updatePwdApi = new Promise((resolve, reject) => {
                resolve(
                    CHANGE_PWD_API({
                        event: "update_password",
                        data: {
                            id: data.id,
                            new_password: updatePwd.data.new_password
                        },
                    })
                );
            });
            updatePwdApi
                .then((res) => {
                    console.log(res);
                    if (res.status === 200) {
                        setNotifyData((prev) => {
                            return {
                                ...prev,
                                loadingFlag: false,
                                confirmFlag: false,
                                successFlag: true,
                                successMsg: res.data.result
                            };
                        });
                        setUpdatePwd({
                            event: "update_password",
                            data: {
                                new_password: "",
                                confirm_password: ""
                            },
                        })
                    }
                })
                .catch((err) => {
                    console.log(err);
                    setNotifyData((prev) => {
                        return {
                            ...prev,
                            loadingFlag: false,
                            confirmFlag: false,
                            errorFlag: true,
                            errorMsg: err.response?.data.reason,
                            headerMsg: err.code,
                        };
                    });
                });
        } else {
            setNotifyData((prev) => ({
                ...prev,
                loadingFlag: false,
                confirmFlag: false,
                errorFlag: true,
                errorMsg: "Invalid passwords or password mismatch.",
                headerMsg: "Error",
            }));
        }
    };
    // console.log({ data })
    // console.log("updatePwd", updatePwd.data.id)
    return (
        <div className={`basic-forminfo set-password ${profile.basicInfo}`}>
            <h5 className={profile.basicHeading}>
                <span className={profile.icons}>
                    <IoKeySharp />
                </span>
                Set Password
            </h5>
            <Form
                validated={validated}
                onSubmit={onHandleUpdatePwd}
                className={profile.basicInfoSetting}
            >
                <Row className="mb-3">

                    <Form.Group
                        as={Col}
                        md="12"
                        className={`mb-3 ${profile.inputGroupSection}`}
                    // controlId="validationNewPwd"
                    >
                        <Form.Label>
                            <span className={`label-icon ${profile.labelIcon}`}>
                                <FaLock />
                            </span>
                            New Password
                            <span className={profile.mendatory}>*</span>
                        </Form.Label>
                        <Form.Control
                            required
                            type={
                                updatePwd.data.new_pwdvisibilty ? "text" : "password"
                            }
                            // type='text'
                            name="new_password"
                            placeholder="New Password"
                            onChange={handleCreatePwdInput}
                            value={updatePwd.data.new_password}
                            isInvalid={updatePwd.data.new_password && !validatePassword(updatePwd.data.new_password)}
                        />
                        <i
                            onClick={(e) => {
                                setUpdatePwd((previous) => ({
                                    ...previous,
                                    data: {
                                        ...previous.data,
                                        new_pwdvisibilty: !previous.data.new_pwdvisibilty,
                                    },
                                }));
                            }}
                            className={profile.userPassHideShow}
                        >
                            {updatePwd.data.new_pwdvisibilty ? (
                                <BsFillEyeFill className={profile.eyeIcon} />
                            ) : (
                                <BsFillEyeSlashFill className={profile.eyeIcon} />
                            )}
                        </i>
                        <Form.Control.Feedback type="invalid">
                            Password must have at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group
                        as={Col}
                        md="12"
                        className={`mb-3 ${profile.inputGroupSection}`}
                    // controlId="validationConfrmPwd"
                    >
                        <Form.Label>
                            <span className={`label-icon ${profile.labelIcon}`}>
                                <FaLock />
                            </span>
                            Confirm password
                            <span className={profile.mendatory}>*</span>
                        </Form.Label>
                        <Form.Control
                            type={updatePwd.data.cnfpwdvisibilty ? "text" : "password"}
                            name="confirm_password"
                            placeholder="Confirm password"
                            required
                            onChange={handleCreatePwdInput}
                            value={updatePwd.data.confirm_password}
                            className={`form-control ${passwordMatchError ? "is-invalid" : ""}`}
                        />
                        <i
                            onClick={(e) => {
                                setUpdatePwd((previous) => ({
                                    ...previous,
                                    data: {
                                        ...previous.data,
                                        cnfpwdvisibilty: !previous.data.cnfpwdvisibilty,
                                    },
                                }));
                            }}
                            className={profile.userPassHideShow}
                        >
                            {updatePwd.data.cnfpwdvisibilty ? (
                                <BsFillEyeFill className={profile.eyeIcon} />
                            ) : (
                                <BsFillEyeSlashFill className={profile.eyeIcon} />
                            )}
                        </i>
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid Confirm password
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <div>
                    <input
                        type="submit"
                        className={`basic-InfoBtn ${profile.basicInfoBtn}`}
                        value="Save"
                        onClick={(e) => {
                            e.preventDefault();
                            setNotifyData((data) => ({
                                ...data,
                                confirmFlag: true,
                                confirmMsg: "Are you sure, You want to update password?",
                                confirmAction: (e) =>
                                    onHandleUpdatePwd(e)
                            }))
                        }}
                    />
                </div>
            </Form>
            <Notification
                notify={NotifyData}
                CloseError={CloseError}
                CloseSuccess={CloseSuccess}
                CloseConfirm={CloseConfirm}
            />
        </div>
    )
}

export default SetPassword