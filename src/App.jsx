import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./App.css";
import MainRoutes from "./Components/Routes/MainRoutes";
import "./Css/Dynamic.scss";
import "./Css/DarkTheme.scss";
import { useDispatch } from "react-redux";
import { SocketDisconnectAction } from "./Redux/RMSAction";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(SocketDisconnectAction());
    };
  }, []);

  return (
    <div>
      <MainRoutes />

    </div>
  );
}

export default App;

// dark light theme
// https://ag-grid.zendesk.com/hc/en-us/articles/4405917557137-Dynamic-Theme-Styling-By-Updating-CSS-Variables
// https://plnkr.co/edit/?open=index.jsx&preview

// https://codesandbox.io/s/3vnx00m6w1?file=/src/ShowcaseLayout.js:959-1276 //react-grid-layout
