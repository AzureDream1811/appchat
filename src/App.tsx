import { RouterProvider } from 'react-router-dom';
import route from './routes/index';

function App() {
  return <RouterProvider router={route} />;
}

export default App;