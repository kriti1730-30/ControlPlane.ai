import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './features/auth/loginPage';
import EmployeeWorkspace from './features/employee/EmployeeWorkspace';
import CustomerOperationsPage from './features/customer-operations/CustomerOperationsPage';
import NotFoundPage from './features/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route path="/employee" element={<EmployeeWorkspace />} />

        <Route
          path="/customer-operations"
          element={<CustomerOperationsPage />}
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}