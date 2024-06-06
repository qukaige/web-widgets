import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";

export function preview(): ReactElement {
    return <HelloWorldSample />;
}

export function getPreviewCss(): string {
    return require("./ui/DataGridDemo.css");
}
