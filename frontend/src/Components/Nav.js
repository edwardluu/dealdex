import React from 'react';
import {Link} from 'react-router-dom'
import NavBar from './NavBar';
import {AuthContext} from "../Context/AuthContext"


function Nav() {

    const navStyle = {
        color: 'white'
    }
    const {userAddress, loading} = React.useContext(AuthContext)

    return (
        <>
            {loading ? <></>: <NavBar/>}
        </>
    )
    
}

export default Nav