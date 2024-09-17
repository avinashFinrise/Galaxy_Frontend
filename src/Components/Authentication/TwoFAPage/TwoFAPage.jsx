import { memo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import dot from '../../../assets/Img/dot.png';
import varification from './TwoFAPage.module.scss';

const TwoFAPage = ({ callback }) => {


  const location = useLocation()
  let navigate = useNavigate();


  const [otpValues, setOtpValues] = useState({
    otp1: '',
    otp2: '',
    otp3: '',
    otp4: ''
  })

  const otp1Ref = useRef()
  const otp2Ref = useRef()
  const otp3Ref = useRef()
  const otp4Ref = useRef()
  const otpbtnRef = useRef()




  const handleChange = (e) => {
    setOtpValues({
      ...otpValues,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className={`container-fluid ${varification.otpPage}`}>
      <div className={`row ${varification.otpverification}`}>
        <div className={`col-md-6 ${varification.inputContainer}`}>
          <div className={varification.otpComponent}>
            <div className={varification.titleContainer}>
              <h2 className={varification.title}>2-Step Verification</h2>
            </div>
            <div className={varification.inputFieldContainer}>
              <form className={varification.form} onSubmit={e => callback(e, Object.values(otpValues).join(""))} >
                <div className={varification.inputfields}>
                  <div className={varification.inputgroup}>
                    <div className={varification.inputbox}>
                      <div className={varification.inputholder}>
                        <input
                          ref={otp1Ref}
                          name='otp1'
                          value={otpValues.otp1}
                          onChange={handleChange}
                          required type="text"
                          className={varification.textbox}
                          maxLength='1'
                          onKeyUp={(e) => { if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Enter') otp2Ref.current.focus() }}
                        />
                      </div>
                    </div>
                    <div className={varification.inputbox}>
                      <div className={varification.inputholder}>
                        <input
                          ref={otp2Ref}
                          name='otp2'
                          value={otpValues.otp2}
                          onChange={handleChange}
                          required
                          type="text"
                          className={varification.textbox}
                          maxLength='1'
                          onKeyUp={(e) => { if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Enter') otp3Ref.current.focus() }}
                        />
                      </div>
                    </div>
                    <div className={varification.inputbox}>
                      <div className={varification.inputholder}>
                        <input
                          ref={otp3Ref}
                          name='otp3'
                          value={otpValues.otp3}
                          onChange={handleChange}
                          required type="text"
                          className={varification.textbox}
                          maxLength='1'
                          onKeyUp={(e) => { if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Enter') otp4Ref.current.focus() }}
                        />
                      </div>
                    </div>
                    <div className={varification.inputbox}>
                      <div className={varification.inputholder}>
                        <input
                          ref={otp4Ref}
                          name='otp4'
                          value={otpValues.otp4}
                          onChange={handleChange}
                          required type="text"
                          className={varification.textbox}
                          maxLength='1'
                        // onKeyUp={(e) => { if (e.key !== 'Backspace' && e.key !== 'Delete') otpbtnRef.current.focus(); verifyOTP(e); }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={varification.buttoncontainer}>
                  <button
                    style={{ border: "none" }}
                    disabled={Object.values(otpValues).join("").length !== 4}
                    type="submit"
                    ref={otpbtnRef}
                    className={varification.btn}
                  // onClick={(e) => verifyOTP(e)}
                  >
                    SEND CODE
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className={`col-md-6 ${varification.imageContainer}`}>
          <div className={varification.banner}>
            <img className={varification.dotsimg} src={dot} alt="dot" />
            <div className={varification.text}>
              <h4 className={varification.h4Tag}>Attention is the new currency</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(TwoFAPage);