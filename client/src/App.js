import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from "./views/Home/Home";
import Signup from "./views/Signup/Signup";
import Login from './views/Login/Login';
import Dashboard from "./Dashboard/Dashboard";
import BlogContent from './views/BlogContent/BlogContent';


function App() {
  return (
      <div>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/Signup" element={<Signup/>} />
              <Route path="/home" element={<Home />} />
              <Route path="/Dashboard" element={<Dashboard/>} />
              <Route path="/BlogContent/:blogId" element={<BlogContent />} />
              <Route path="/BlogContent" element={<BlogContent/>} />

            </Routes>
          </BrowserRouter>
      </div>
  );
}

export default App;
