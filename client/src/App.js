import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route ,Outlet } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import ArticleNew from './Components/ArticleNew';
import ArticleView from './Components/ArticleView';
import ArticleEditor from './Components/ArticleEditor';
import Userdata from './Components/Userdata';
import Login from './Components/Login';
import  Thumbnail from './Components/Thumbnail';
import Revoke from './Components/Revoke';
import Footer from './Components/Footer';
import Testing from './Components/Testing';
import ActivePage from './Components/ActivePage';
import Storyassign from './Components/StoryAssign';
import ProfilePage from './Components/Profile';
import ImageConverter from './Components/ImageConversion';
import PagePreview from './Components/PagePreview';
// import PressFTPs from './Components/PressFTPs';


 
const Layout = () => {
  return (
    <div className="App">
      <Sidebar />
      <Outlet />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/' element={<Layout />}>
          <Route path='add-article' element={<ArticleNew />} />
          <Route path='article-editor/:articleId/:articleIssueDate' element={<ArticleEditor />} />
          <Route path='article-view' element={<ArticleView />} />
          <Route path='user' element={<Userdata />} />          
          <Route path='thumbnail' element={<Thumbnail />} />
          <Route path='pagepreview' element={<PagePreview />} />
          <Route path='revoke' element={<Revoke />} />
          <Route path='testing' element={<Testing />} />
          <Route path='active-page' element={<ActivePage />} />
          <Route path='storyassign' element={<Storyassign />} />
          <Route path='ProfilePage' element={<ProfilePage />} />
          <Route path='imageconverter' element={<ImageConverter />} />
          {/* <Route path='pressftp' element={<PressFTPs />} /> */}
        </Route>
      </Routes>     
      <Footer />  
    </BrowserRouter>
  );
};
 
export default App;