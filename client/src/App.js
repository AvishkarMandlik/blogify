import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from "./views/Home/Home";
import Signup from "./views/Signup/Signup";
import Login from './views/Login/Login';
import Dashboard from "./Dashboard/Dashboard";
import CreateBlogs from "./Dashboard/createBlogs";
import BlogContent from './views/BlogContent/BlogContent';

function App() {
  return (
      <div>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Signup" element={<Signup/>} />
              <Route path="/Login" element={<Login />} />
              <Route path="/Dashboard" element={<Dashboard/>} />
              <Route path="/createBlogs" element={<CreateBlogs/>} />
              <Route path="/BlogContent" element={<BlogContent/>} />

            </Routes>
          </BrowserRouter>
      </div>
  );
}

export default App;
