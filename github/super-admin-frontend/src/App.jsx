import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import SuperPanel from './components/SuperPanel';
import AdminCreate from './components/admin/AdminCreate';
import AdminEdit from './components/admin/AdminEdit';
import AdminManagement from './components/admin/AdminManagement';
import CampusCreate from './components/campus/CampusCreate';
import CampusEdit from './components/campus/CampusEdit';
import CampusManagement from './components/campus/CampusManagement';
import GroupCreate from './components/group/GroupCreate';
import GroupEdit from './components/group/GroupEdit';
import GroupManagement from './components/group/GroupManagement';
import SuperLogin from './components/login/SuperLogin';
import ProgramCreate from './components/program/ProgramCreate';
import ProgramEdit from './components/program/ProgramEdit';
import ProgramManagement from './components/program/ProgramManagement';
import StudentCreate from './components/student/StudentCreate';
import StudentEdit from './components/student/StudentEdit';
import StudentManagement from './components/student/StudentManagement';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Switch>
          <Route path="/" exact component={SuperLogin} />
          <Route path="/dashboard" component={SuperPanel} />
          <Route path="/admin/create" component={AdminCreate} />
          <Route path="/admin/edit/:id" component={AdminEdit} />
          <Route path="/admin/manage" component={AdminManagement} />
          <Route path="/campus/create" component={CampusCreate} />
          <Route path="/campus/edit/:id" component={CampusEdit} />
          <Route path="/campus/manage" component={CampusManagement} />
          <Route path="/group/create" component={GroupCreate} />
          <Route path="/group/edit/:id" component={GroupEdit} />
          <Route path="/group/manage" component={GroupManagement} />
          <Route path="/program/create" component={ProgramCreate} />
          <Route path="/program/edit/:id" component={ProgramEdit} />
          <Route path="/program/manage" component={ProgramManagement} />
          <Route path="/student/create" component={StudentCreate} />
          <Route path="/student/edit/:id" component={StudentEdit} />
          <Route path="/student/manage" component={StudentManagement} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;