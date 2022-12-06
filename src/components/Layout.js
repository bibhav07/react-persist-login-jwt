import { Outlet } from "react-router-dom"

const Layout = () => {
    return (
        <main className="App">
            <h3>--HEADER</h3>
            <Outlet />
            <h3>--FOOTER</h3>
        </main>
    )
}

export default Layout
