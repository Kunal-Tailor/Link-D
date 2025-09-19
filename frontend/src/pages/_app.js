import "@/styles/globals.css";
import {store} from "@/config/redux/store";
import { Provider } from "react-redux";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function App({ Component, pageProps }) {
  return <>
  <Provider store={store}>
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  </Provider>
  </>;
}
