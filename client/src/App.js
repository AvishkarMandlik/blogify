import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from "./views/Home/Home";
import Signup from "./views/Signup/Signup";
import Login from './views/Login/Login';
import Dashboard from "./Dashboard/Dashboard";
function App() {
  return (
      <div>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Signup" element={<Signup/>} />
              <Route path="/Login" element={<Login />} />
              <Route path="/Dashboard" element={<Dashboard />} />
            </Routes>
          </BrowserRouter>
      </div>
  );
}

export default App;
