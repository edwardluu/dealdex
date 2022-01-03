import React from "react"
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom'
import {AuthContext} from "../Context/AuthContext"
import Loader from "react-loader-spinner"
function PrivateRoute ({ children, ...rest }) {
    const {userAddress, loading} = React.useContext(AuthContext)
    return (
      <>
        {loading ? <Loader />:
          <Route {...rest} render={() => {
            return userAddress ? children: <Redirect to='/login' />
          }} />
        }

      </>
    )
}

export default PrivateRoute