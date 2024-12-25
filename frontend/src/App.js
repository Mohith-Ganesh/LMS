import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import { Signup } from "./pages/Signup/Signup";
import { Signin } from "./pages/Signin/Signin";
import StudentDashboard from "./pages/Student/Student";
import ProfessorDashboard from "./pages/Professor/Professor";
import AdminDashboard from "./pages/Admin/Admin";
import {CreateProfile} from "./profile/CreateProfile"
import ProtectedRoute from "./protectedRoute/ProtectedRoute";
import Guest from "./pages/Guest/Guest";
import TakenBooks from "./pages/TakenBooks/TakenBooks";
import LibrarianDashboard from "./pages/Librarian/Librarian";
import Chart from "./pages/Chart/Chart";



function App() {
  return (
    <>
       <BrowserRouter>
        <Routes>
          <Route path="/" element={<Guest/>}/>
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/chart" element={<ProtectedRoute element={Chart}/>}/>
          <Route path="/student-dashboard" element={<ProtectedRoute element={StudentDashboard}/>} />
          <Route path="/professor-dashboard" element={<ProtectedRoute element={ProfessorDashboard} />} />
          <Route path="/administrator-dashboard" element={<ProtectedRoute element={AdminDashboard} />}/>
          <Route path="/librarian-dashboard" element={<ProtectedRoute element={LibrarianDashboard}/>}/>
          <Route path="/create-profile" element={<ProtectedRoute element={CreateProfile}/>}/>
          <Route path="/taken-books" element={<ProtectedRoute element={TakenBooks} />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App