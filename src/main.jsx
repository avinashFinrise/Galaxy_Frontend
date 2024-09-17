import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import RMSStoree from "./Redux/RMSStore.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={RMSStoree}>
      {/* <ErrorBoundary fallback="error"> */}
      <App />
      {/* </ErrorBoundary> */}
    </Provider>
  </BrowserRouter>
);
