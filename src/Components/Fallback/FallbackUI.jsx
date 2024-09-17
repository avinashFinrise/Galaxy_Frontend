import { Spin } from 'antd';
import styles from "./fallback.module.scss"

const FallBackUi = () => {
    return (
        <div className="container">
            <Spin className={styles.spinner} tip="Loading" size="large">
                <div className="content" />
            </Spin>
        </div>
    )
}

export default FallBackUi