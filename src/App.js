import logo from './logo.svg';
import './App.css';
import Login from './Login';
import Registration from './Registration';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homep from './Homep';
import Profile from './Profile';
import Event from './Event';
import Orgevent from './Orgevent';
import EditEvent from './EditEvent';

function App() {
  return (
   
    <div className="App">
      <Router>
      <Routes>
        <Route path="/" element = {<Login />} />
        <Route path="/registration" element = {<Registration />} />
        <Route path="/home" element = {<Homep/>}/>
        <Route path="/profile" element = {<Profile/>}/>
        <Route path="/event/:id" element=  {<Event/>}/>
        <Route path="/orgevent" element = {<Orgevent/>}/>
        <Route path="/edit-event/:id" element = {<EditEvent/>}/>
      </Routes>
    </Router>
    </div>

  );
}

export default App;
