import { Skeleton } from 'antd';
import { FaChartGantt } from "react-icons/fa6";
import styles from "./fallback.module.scss";

const CardFallback = ({ type = "common", Icon = FaChartGantt, withContent = false }) => {
    return (
        <div className={styles.container}>
            {type == "common" && (
                <>
                    <div className={styles.header}>
                        <Skeleton.Avatar active={true} size="large" shape={"circle"} />
                        <div>
                            <Skeleton.Input active={true} size="small" block={false} />
                            <Skeleton.Input active={true} size="small" block={false} />
                            <Skeleton.Input active={true} size="small" block={false} />
                        </div>
                    </div>
                    <Skeleton active={true} />
                </>
            )}
            {type == "graph" && (
                <>
                    <div className={styles.header}>
                        <Skeleton.Avatar active={true} size="large" shape={"circle"} />
                        <div>
                            <Skeleton.Input active={true} size="small" block={false} />
                        </div>
                    </div>
                    <div className={styles.graphWrappher}>
                        <Skeleton.Node active={true}   >
                            <Icon
                                style={{
                                    fontSize: 40,
                                    color: '#bfbfbf',
                                }}
                            />
                        </Skeleton.Node>

                        {withContent && <Skeleton paragraph={1} active />}
                    </div>
                </>
            )}
        </div>
    )
}

export default CardFallback