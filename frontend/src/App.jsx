import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Authorize from "./components/Authorize";
import UserNavBar from "./components/UserNavBar";
import Courses from "./components/Courses";
import PurchasedCourses from "./components/PurchasedCourses";
import AdminNavBar from "./components/AdminNavBar";
import CreateCourseForm from "./components/CreateCourseForm";
import CreatedCourses from "./components/CreatedCourses";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import UnAuthorized from "./components/Unauthorized";
function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/authorize" element={<Authorize />}>
            <Route index  element={<Navigate to="signup" replace />} />
            <Route path="signin" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Route>
          <Route path="/user" element={<UserNavBar />}>
            <Route index element={<Navigate to="courses" replace />} />
            <Route path="courses" element={<Courses />} />
            <Route path="purchases" element={<PurchasedCourses />} />
          </Route>
          <Route path="/admin" element={<AdminNavBar />}>
            <Route index element={<Navigate to="mycreations" replace />} />
            <Route path="create" element={<CreateCourseForm />} />
            <Route path="mycreations" element={<CreatedCourses />} />
          </Route>
          <Route path="/unauthorized" element={<UnAuthorized />}/> 
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;