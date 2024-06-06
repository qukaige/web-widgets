import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";

import { DataGridDemoContainerProps } from "../typings/DataGridDemoProps";

import "./ui/DataGridDemo.css";


export function DataGridDemo(props : DataGridDemoContainerProps): ReactElement {
    debugger
    console.info("datasource=", props)
    return <HelloWorldSample sampleText="xxx" />;
}
