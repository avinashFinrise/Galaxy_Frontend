import { Suspense } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'
import FallBackUi from '../Fallback/FallbackUI'

const DefaultLayout = () => {
    return (
        <Suspense fallback={<FallBackUi />}>
            <ErrorBoundary>
                <Outlet />
            </ErrorBoundary>
        </Suspense>
    )
}

export const ProtectedRoutes = () => {
    const isLoggedIn = useSelector(state => state.isLoggedIn)
    return isLoggedIn ? <DefaultLayout /> : <Navigate to="/" />;
    // return <DefaultLayout />
}

export const PublicRoutes = () => {
    const isLoggedIn = useSelector(state => state.isLoggedIn)
    // const prevRoute = localStorage.getItem("currentRoute")
    return !isLoggedIn && <DefaultLayout />;
}

export const AccountRotues = () => {
    const isLoggedIn = useSelector(state => state.loginDetails)
    let userData = localStorage.getItem("data") || JSON.parse(localStorage.getItem("data")).userData
    userData = JSON.parse(userData)
    return (isLoggedIn && userData.role == "account") ? <DefaultLayout /> : <Navigate to="/" />
}

export const RiskRotues = () => {
    const isLoggedIn = useSelector(state => state.loginDetails)
    let userData = localStorage.getItem("data") || JSON.parse(localStorage.getItem("data")).userData
    userData = JSON.parse(userData)
    return (isLoggedIn && userData.role == "risk") ? <DefaultLayout /> : <Navigate to="/" />
}
