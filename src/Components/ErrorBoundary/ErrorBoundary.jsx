import errStyle from './ErrorBoundary.module.scss'

import { Component } from 'react';
import ErrorImg from "../../assets/Img/errorImg.png"
import { IoMdAdd } from "react-icons/io";


class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: { error: null, info: null }, isOpen: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
        this.setState({ error: { error, errorInfo: errorInfo.componentStack } })
    }



    render() {
        if (this.state.hasError) {
            return (
                <div className={`${errStyle.container} container`}  >
                    <div className={`${errStyle.imgContainer} imgContainer`} >
                        <img src={ErrorImg} />
                    </div>
                    <h1 className={errStyle.msg} >Aaaah! Something went wrong</h1>
                    <p className={errStyle.desc} >Please bear with us as we rectify the problem. Your understanding is greatly appreciated.</p>
                    <p className={errStyle.desc}>You may also refresh the page or try again later.</p>
                    <div className={`${errStyle.btnWrapper} btnWrapper`} >
                        <button onClick={() => window.location.reload()}>Try Again</button>
                        <button onClick={() => window.history.back()} >Go Back</button>
                    </div>
                    {
                        this.state.error.error &&
                        <pre onClick={() => this.setState({ isOpen: !this.state.isOpen })}>
                            <IoMdAdd style={{ transform: this.state.isOpen ? "rotate(45deg)" : "rotate(0deg)" }} />
                            {this.state.error.error.toString()}<br />
                            {this.state.isOpen && this.state.error.errorInfo}
                        </pre>
                    }
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
