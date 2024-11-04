import {Outlet , Navigate} from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateRoute = () => {
    const isLoggedIn = Cookies.get('loggedIn');
    return (
        <>
        {isLoggedIn ? <Outlet /> : <Navigate to= "/" />}
        </>
    )
}

export default PrivateRoute;