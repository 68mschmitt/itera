import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { PromptPage } from './pages/PromptPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prompts/:id" element={<PromptPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
