
const useValidate = (setNotifyData) => {
    const validate = (validations) => {
        for (let error of validations) {
            if (error.condition) {
                setNotifyData((prev) => ({
                    ...prev,
                    errorFlag: true,
                    confirmFlag: false,
                    errorMsg: error.message,
                }));
                return false;
            }
        }
        return true
    }

    return validate
}

export default useValidate