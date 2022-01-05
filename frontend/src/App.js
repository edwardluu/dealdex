import logo from './logo.svg'
import './App.css'
import AccountView from './Components/AccountView'
import MakeDealForm from './Components/MakeDealForm'
import Nav from './Components/Nav'
import {BrowserRouter as Router, Switch, Route, withRouter} from 'react-router-dom'
import { ChakraProvider, theme  } from '@chakra-ui/react'

import DealDetailsView from './Components/DealDetailsView'
import PrivateRoute from "./Utils/PrivateRoute"
import {AuthProvider} from "./Context/AuthContext"
import LoginView from "./Components/LoginView"
import HomeView from "./Components/HomeView"

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <ChakraProvider theme={theme} options={{useSystemColorMode: true}}>        
          <Nav />
          <Switch>
            <Route path="/" exact>
              <HomeView />
            </Route>

            <Route path="/createDeal" >
              <MakeDealForm />
            </Route>

            <PrivateRoute path="/account" >
              <AccountView  />
            </PrivateRoute>
            <Route path="/dealDetails" component={DealDetailsView} />
            <Route path="/login" component={LoginView} />
          </Switch>
        
        </ChakraProvider>
      </div>
    </AuthProvider>
  );
}

export default withRouter(App);
