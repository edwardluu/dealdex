import './App.css'
import { Switch, Route, withRouter} from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/provider'
import { MoralisProvider } from "react-moralis";
import theme from './Utils/DealDexTheme.js'

import DealDetailsView from './Components/DealDetailsView'
import PrivateRoute from "./Utils/PrivateRoute"
import {AuthProvider} from "./Context/AuthContext"
import LoginView from "./Components/LoginView"
import HomeView from "./Components/HomeView"
import AccountView from './Components/AccountView'
import MakeDealForm from './Components/MakeDealForm'
import Nav from './Components/Nav'

export const APP_ID = "U4597pIoac2usSt6amOxi7pnRlwRV8fL4fVrLOWi";
export const SERVER_URL = "https://fspd6ypb2hac.usemoralis.com:2053/server";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
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
        </MoralisProvider>
      </div>
    </AuthProvider>
  );
}

export default withRouter(App);
