import React, { useState, useRef, useEffect } from 'react';
import style from './OTPComp.module.scss'
import { Form } from 'react-bootstrap';



const OTPComp = ({ setOtp, otp, onSubmit }) => {

    const inputsRef = useRef([]);
    const [isOtpFilled, setIsOtpFilled] = useState(false);
    // console.log(setOtp, otp, onSubmit)
    const handleChange = (index, value) => {
        if (isNaN(value)) return alert("Please enter a valid number");
        setOtp((prevOtp) => {
            const newOtp = [...prevOtp];
            if (newOtp[index]) {
                // If the input field already has a value, split the new value and filter out the previous value
                if (typeof value === "string") {
                    value = value.split("").filter((e) => e !== newOtp[index]).join("");

                    // If the new value is empty after filtering, it means the previous and new values were the same
                    // In this case, assign the previous value to ensure it remains unchanged
                    if (!value) {
                        value = otp[index];
                    }
                }
            }
            newOtp[index] = value;
            return newOtp;
        });

        if (value !== '' && index < inputsRef.current.length - 1) {
            inputsRef.current[index + 1].focus();
        }
    };


    useEffect(() => {
        inputsRef.current[0].focus();
    }, [])

    const handleKeyDown = (index, event) => {
        if (event.key === 'Backspace' && index >= 0) {
            setOtp((prevOtp) => {
                prevOtp[index] = "";
                return [...prevOtp];
            });
            inputsRef.current[index - 1].focus();
        }
    };

    useEffect(() => {

        if (otp.length !== 6) return
        else {
            const filteredOtp = otp.filter(val => val && !isNaN(val));
            const isOtpFilledFull = filteredOtp.length === 6;
            setIsOtpFilled(isOtpFilledFull);
        }
        // console.log(isOtpFilled, otp)
    }, [otp]);

    return (
        <div className={`otp-mainsection ${style.mainsection}`}>
            <div className=''>
                <h3>OTP has been send to Admin</h3>
            </div>
            <Form onSubmit={(e) => {
                e.preventDefault();
                onSubmit()
            }
            }>
                <div>
                    {new Array(6).fill().map((_, i) => {
                        return <input //in this we cant use input limit as 1 because when user will type in already filled input it will not allow to override
                            key={i}
                            type="text"
                            required
                            value={otp[i] || ''}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            ref={(ref) => (inputsRef.current[i] = ref)}
                        />
                    })}

                </div>

                <div className={style.bottomSection}>
                    <button
                        type='submit'
                        style={{
                            backgroundColor: isOtpFilled ? '#5E81AC' : 'gray',
                            cursor: isOtpFilled ? 'pointer' : 'not-allowed'
                        }}
                    // onClick={() => {
                    //     console.log("lol");
                    //     onSubmit()
                    // }}
                    >Validate</button>
                </div >
            </Form>

        </div>
    );
};

export default OTPComp;