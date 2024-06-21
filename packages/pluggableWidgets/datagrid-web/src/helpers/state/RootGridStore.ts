import { ColumnGroupStore } from "./ColumnGroupStore";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { HeaderFiltersStore } from "./HeaderFiltersStore";
import { FilterCondition } from "mendix/filters";
import { SortInstruction } from "../../typings/sorting";
import { GridPersonalizationStore } from "./GridPersonalizationStore";

export class RootGridStore {
    columnsStore: ColumnGroupStore;
    headerFiltersStore: HeaderFiltersStore;
    settingsStore: GridPersonalizationStore;

    constructor(props: DatagridContainerProps) {
        // 主要设置分页数量, 是否查询总数设置
        this.setInitParams(props);
        // 设置列相关的操作, 列初始化, 列排序, 列筛选等
        this.columnsStore = new ColumnGroupStore(props);
        // TODO KG 应该是列赛选
        this.headerFiltersStore = new HeaderFiltersStore(props);
        this.settingsStore = new GridPersonalizationStore(props, this.columnsStore);
    }

    dispose(): void {
        this.settingsStore.dispose();
    }

    private setInitParams(props: DatagridContainerProps): void {
        if (props.pagination === "buttons") {
            props.datasource.requestTotalCount(true);
        }

        // Set initial limit
        props.datasource.setLimit(props.pageSize);
    }

    updateProps(props: DatagridContainerProps): void {
        this.columnsStore.updateProps(props);
        this.settingsStore.updateProps(props);
    }

    get isLoaded(): boolean {
        return this.columnsStore.loaded;
    }

    get filterConditions(): FilterCondition[] | undefined {
        if (!this.headerFiltersStore.isDirty) {
            return undefined;
        }

        return this.columnsStore.filterConditions
            .filter((filter): filter is FilterCondition => filter !== undefined)
            .concat(this.headerFiltersStore.filterConditions);
    }

    get sortInstructions(): SortInstruction[] | undefined {
        return this.columnsStore.sortInstructions;
    }
}
