import {BrowserRouter as HashRouter, Routes, Route} from "react-router-dom";
import ThemeRoutes from "./routes/Router";


function App() {
  
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route path="/"  element ={ThemeRoutes[0].layout}>
            {ThemeRoutes[0].children[0]}
          </Route>
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
