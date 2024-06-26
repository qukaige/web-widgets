import { createElement, Fragment, ReactElement, useCallback, useEffect, useMemo, useRef } from "react";
import ReactPlotlyChartComponent, { PlotParams } from "react-plotly.js";
import { Config, Data, Layout } from "plotly.js";
import deepmerge from "deepmerge";
import { Playground, useChartsPlaygroundState } from "./Playground/Playground";
import { CodeEditor } from "./Playground/CodeEditor";
import { ifNonEmptyStringElseEmptyObjectString } from "./Playground/utils";
import { ExtraTraceProps } from "../types";

const PREVENT_DEFAULT_INLINE_STYLES_BY_PASSING_EMPTY_OBJ = {};

declare module "plotly.js" {
    interface PlotDatum {
        /** This array appears on only when aggregation is used */
        pointIndices?: number[];
    }
}

type PlotTrace = Partial<Data> & ExtraTraceProps;
export interface ChartProps {
    data: PlotTrace[];
    configOptions: Partial<Config>;
    layoutOptions: Partial<Layout>;
    seriesOptions: Partial<Data>;
    customConfig: string | undefined;
    customLayout: string | undefined;
}

export const Chart = ({
    data,
    configOptions,
    layoutOptions,
    seriesOptions,
    customConfig,
    customLayout
}: ChartProps): ReactElement => {
    const customLayoutOptions = useMemo<Partial<Layout>>(
        () => deepmerge(layoutOptions, fromJSON(customLayout)),
        [layoutOptions, customLayout]
    );

    const customConfigOptions = useMemo<Partial<Config>>(
        () => deepmerge(configOptions, fromJSON(customConfig)),
        [configOptions, customConfig]
    );

    const plotlyData = useMemo(() => createPlotlyData(data, seriesOptions), [data, seriesOptions]);
    const aggregateData = (xValues: any[], yValues: any[]): any[] => {
        const aggregatedData: { [key: string]: number } = {};
        const order: string[] = [];

        for (let i = 0; i < xValues.length; i++) {
            const x = xValues[i];
            const y = parseFloat(yValues[i]);

            if (aggregatedData[x] !== undefined) {
                aggregatedData[x] += y;
                order.push(x);
            } else {
                aggregatedData[x] = y;
                order.push(x);
            }
        }

        return order.map(x => aggregatedData[x]);
    };
    const formatYValue = (y: any, f: any) => {
        if (y >= 1000000000) {
            return (y / 1000000000).toFixed(f) + "B";
        } else if (y >= 1000000) {
            return (y / 1000000).toFixed(f) + "M";
        } else if (y >= 1000) {
            return (y / 1000).toFixed(f) + "K";
        } else {
            return y.toFixed(f);
        }
    };
    // @ts-ignore
    if (plotlyData.length > 0 && plotlyData[0]["customobj"]) {
        plotlyData.forEach(item => {
            // @ts-ignore
            if (item.customobj) {
                // @ts-ignore
                if (item.customobj.y) {
                    // @ts-ignore
                    let yArr = item["y"];
                    // @ts-ignore
                    let xArr = item["x"];
                    // @ts-ignore
                    if (item["transforms"].length > 0) {
                        // @ts-ignore
                        item["text"] = aggregateData(xArr, yArr).map(v =>
                            formatYValue(v, item.customobj.toFixed ? item.customobj.toFixed : 1)
                        );
                    } else {
                        // @ts-ignore
                        item["text"] = yArr.map(v =>
                            formatYValue(v, item.customobj.toFixed ? item.customobj.toFixed : 1)
                        );
                    }
                }
                // @ts-ignore
                if (item.customobj.x) {
                    // @ts-ignore
                    // @ts-ignore
                    let yArr = item["y"];
                    // @ts-ignore
                    let xArr = item["x"];
                    // @ts-ignore
                    if (item["transforms"].length > 0) {
                        // @ts-ignore
                        item["text"] = aggregateData(yArr, xArr).map(v =>
                            formatYValue(v, item.customobj.toFixed ? item.customobj.toFixed : 1)
                        );
                    } else {
                        // @ts-ignore
                        item["text"] = xArr.map(v =>
                            formatYValue(v, item.customobj.toFixed ? item.customobj.toFixed : 1)
                        );
                    }
                }
            }
        });
    }
    console.info("kg", "plotlyData=", plotlyData);

    const handleChartClick = useCallback<NonNullable<PlotParams["onClick"]>>(
        event => {
            // As this is click handler, this event has single, "clicked" point, so we can destruct.
            const [{ curveNumber, pointIndex, pointIndices }] = event.points;
            const { dataSourceItems, onClick } = data[curveNumber];
            const itemIndex = getItemIndex(pointIndex, pointIndices);
            const item = dataSourceItems[itemIndex];
            onClick?.(item);
        },
        [data]
    );

    useResizeOnDataReadyEffect(data);

    useEffect(() => {
        console.info("kg useEffect", "plotlyData=", plotlyData);
    }, [plotlyData]);

    return (
        <ReactPlotlyChartComponent
            className="mx-react-plotly-chart"
            data={plotlyData}
            style={PREVENT_DEFAULT_INLINE_STYLES_BY_PASSING_EMPTY_OBJ}
            config={customConfigOptions}
            layout={customLayoutOptions}
            onClick={handleChartClick}
        />
    );
};

function useResizeOnDataReadyEffect(data: unknown[]): void {
    const hasForceUpdatedReactPlotly = useRef(false);

    useEffect(() => {
        // The lib doesn't autosize the chart properly in the beginning (even with the `responsive` config),
        // so we manually trigger a refresh once when everything is ready.
        if (!hasForceUpdatedReactPlotly.current && data.length > 0) {
            window.dispatchEvent(new Event("resize"));
            hasForceUpdatedReactPlotly.current = true;
        }
    }, [data]);
}

function createPlotlyData(traces: PlotTrace[], baseOptions: Partial<Data>): Data[] {
    return traces.map(trace => {
        const item: Partial<PlotTrace> = { ...trace };
        const customTraceOptions = fromJSON(item.customSeriesOptions);
        // Sanitize trace before passing it to plotly
        delete item.customSeriesOptions;
        delete item.dataSourceItems; // Each ObjectItem has recursive refs so, we need to remove this array.

        return deepmerge.all([baseOptions, item, customTraceOptions], {
            arrayMerge: (target, source): any[] => {
                const source1 = target.filter(x => x !== undefined);
                const source2 = source.filter(x => x !== undefined);

                return deepmerge(source1, source2);
            }
        });
    });
}

function fromJSON(value: string | null | undefined): object {
    return JSON.parse(ifNonEmptyStringElseEmptyObjectString(value));
}

function getItemIndex(pointIndex: number | undefined, pointIndices: number[] | undefined): number {
    const index = pointIndex ?? pointIndices?.at(-1);

    if (typeof index !== "number") {
        throw new Error("Unable to get item index for given point.");
    }

    return index;
}

const irrelevantSeriesKeys = ["x", "y", "z", "customSeriesOptions"];

export const ChartWithPlayground = ({
    data,
    layoutOptions,
    configOptions,
    seriesOptions,
    customLayout,
    customConfig
}: ChartProps): ReactElement => {
    const {
        activeEditableCode,
        activeView,
        changeActiveView,
        changeEditableCode,
        changeEditableCodeIsValid,
        editedConfig,
        editedData,
        editedLayout
    } = useChartsPlaygroundState({
        data,
        customConfig,
        customLayout
    });

    const activeModelerCode = useMemo(() => {
        if (activeView === "layout") {
            return layoutOptions;
        }
        if (activeView === "config") {
            return configOptions;
        }
        const index = parseInt(activeView, 10);
        return Object.fromEntries(
            Object.entries(data[index]).filter(([key]) => !irrelevantSeriesKeys.includes(key))
        ) as Partial<Data>;
    }, [activeView, configOptions, data, layoutOptions]);

    return (
        <Playground.Wrapper
            renderPanels={
                <Fragment>
                    <Playground.Panel key={activeView} heading="Custom settings">
                        <CodeEditor
                            readOnly={false}
                            value={activeEditableCode}
                            onChange={changeEditableCode}
                            onValidate={annotations => changeEditableCodeIsValid(!annotations.length)}
                        />
                    </Playground.Panel>
                    <Playground.Panel
                        key="modeler"
                        heading="Settings from the Studio/Studio Pro"
                        headingClassName="read-only"
                    >
                        <CodeEditor
                            readOnly
                            value={JSON.stringify(activeModelerCode, null, 2)}
                            overwriteValue={activeEditableCode}
                        />
                    </Playground.Panel>
                </Fragment>
            }
            renderSidebarHeaderTools={
                <Playground.SidebarHeaderTools>
                    <Playground.Select
                        onChange={changeActiveView}
                        options={[
                            { name: "Layout", value: "layout", isDefaultSelected: true },
                            ...data.map((serie, index) => ({
                                name: serie.name || `trace ${index}`,
                                value: index,
                                isDefaultSelected: false
                            })),
                            { name: "Configuration", value: "config", isDefaultSelected: false }
                        ]}
                    />
                </Playground.SidebarHeaderTools>
            }
        >
            <Chart
                data={editedData}
                layoutOptions={layoutOptions}
                customLayout={editedLayout}
                configOptions={configOptions}
                customConfig={editedConfig}
                seriesOptions={seriesOptions}
            />
        </Playground.Wrapper>
    );
};
