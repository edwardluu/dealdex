import './App.css'
import { Switch, Route, withRouter} from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/provider'
import theme from './Utils/DealDexTheme.js'

import DealDetailsView from './Components/DealDetailsView'
import PrivateRoute from "./Utils/PrivateRoute"
import {AuthProvider} from "./Context/AuthContext"
import LoginView from "./Components/LoginView"
import HomeView from "./Components/HomeView"
import AccountView from './Components/AccountView'
import MakeDealForm from './Components/MakeDealForm'
import Nav from './Components/Nav'

let Moralis = require('moralis');
const serverUrl = "https://lnfsknicm8rg.usemoralis.com:2053/server";
const appId = "MTLvk9d6oeRVS6x9Nv92Kk4fxycQQUmRn3rcKX6m";
Moralis.start({ serverUrl, appId });

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
