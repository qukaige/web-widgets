"use strict";
var __spreadArray =
    (this && this.__spreadArray) ||
    function (to, from, pack) {
        if (pack || arguments.length === 2)
            for (var i = 0, l = from.length, ar; i < l; i++) {
                if (ar || !(i in from)) {
                    if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                    ar[i] = from[i];
                }
            }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnGroupStore = void 0;
var mobx_1 = require("mobx");
var ColumnsSortingStore_1 = require("./ColumnsSortingStore");
var ColumnStore_1 = require("./column/ColumnStore");
var ColumnFilterStore_1 = require("./column/ColumnFilterStore");
var ColumnGroupStore = /** @class */ (function () {
    function ColumnGroupStore(props) {
        var _this = this;
        this._allColumnsById = new Map();
        this._allColumns = [];
        this.columnFilters = [];
        // 构建所有columns
        props.columns.forEach(function (columnProps, i) {
            var column = new ColumnStore_1.ColumnStore(i, columnProps, _this);
            _this._allColumnsById.set(column.columnId, column);
            _this._allColumns[i] = column;
            _this.columnFilters[i] = new ColumnFilterStore_1.ColumnFilterStore(columnProps, props.datasource.filter);
        });
        this.sorting = new ColumnsSortingStore_1.ColumnsSortingStore(
            (0, ColumnsSortingStore_1.sortInstructionsToSortRules)(props.datasource.sortOrder, this._allColumns)
        );
        // 设置可观察属性
        (0, mobx_1.makeObservable)(this, {
            _allColumns: mobx_1.observable,
            loaded: mobx_1.computed,
            _allColumnsOrdered: mobx_1.computed,
            availableColumns: mobx_1.computed,
            visibleColumns: mobx_1.computed,
            filterConditions: mobx_1.computed.struct,
            settings: mobx_1.computed.struct,
            updateProps: mobx_1.action,
            createSizeSnapshot: mobx_1.action,
            swapColumns: mobx_1.action,
            applySettings: mobx_1.action
        });
    }
    ColumnGroupStore.prototype.updateProps = function (props) {
        var _this = this;
        props.columns.forEach(function (columnProps, i) {
            _this._allColumns[i].updateProps(columnProps);
            _this.columnFilters[i].updateProps(columnProps);
        });
        if (this.visibleColumns.length < 1) {
            // if all columns are hidden after the update - reset hidden state for all columns
            this._allColumns.forEach(function (c) {
                c.isHidden = false;
            });
        }
    };
    ColumnGroupStore.prototype.swapColumns = function (source, _a) {
        var target = _a[0],
            placement = _a[1];
        var columnSource = this._allColumnsById.get(source);
        var columnTarget = this._allColumnsById.get(target);
        columnSource.orderWeight = columnTarget.orderWeight + (placement === "after" ? 1 : -1);
        // normalize columns
        this._allColumnsOrdered.forEach(function (column, idx) {
            column.orderWeight = idx * 10;
        });
    };
    ColumnGroupStore.prototype.createSizeSnapshot = function () {
        this._allColumns.forEach(function (c) {
            return c.takeSizeSnapshot();
        });
    };
    Object.defineProperty(ColumnGroupStore.prototype, "loaded", {
        get: function () {
            // check if all columns loaded, then we can render
            return this._allColumns.every(function (c) {
                return c.loaded;
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ColumnGroupStore.prototype, "_allColumnsOrdered", {
        get: function () {
            return __spreadArray([], this._allColumns, true).sort(function (columnA, columnB) {
                return columnA.orderWeight - columnB.orderWeight;
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ColumnGroupStore.prototype, "availableColumns", {
        get: function () {
            // columns that are not hidden by visibility expression
            // visible field name is misleading, it means available
            return __spreadArray([], this._allColumnsOrdered, true).filter(function (column) {
                return column.isAvailable;
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ColumnGroupStore.prototype, "visibleColumns", {
        get: function () {
            // list of columns that are available and not in the set of hidden columns
            return __spreadArray([], this.availableColumns, true).filter(function (column) {
                return !column.isHidden;
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ColumnGroupStore.prototype, "filterConditions", {
        get: function () {
            return this.columnFilters
                .map(function (cf) {
                    return cf.condition;
                })
                .filter(function (filter) {
                    return filter !== undefined;
                });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ColumnGroupStore.prototype, "sortInstructions", {
        get: function () {
            return (0, ColumnsSortingStore_1.sortRulesToSortInstructions)(this.sorting.rules, this._allColumns);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ColumnGroupStore.prototype, "settings", {
        get: function () {
            return this._allColumns.map(function (column) {
                return column.settings;
            });
        },
        enumerable: false,
        configurable: true
    });
    ColumnGroupStore.prototype.applySettings = function (settings) {
        var _this = this;
        settings.forEach(function (conf) {
            var column = _this._allColumnsById.get(conf.columnId);
            if (!column) {
                console.warn(
                    "Error while restoring personalization config. Column '".concat(conf.columnId, "' is not found.")
                );
                return;
            }
            column.applySettings(conf);
        });
        this.sorting.rules = settings
            .filter(function (s) {
                return s.sortDir && s.sortWeight !== undefined;
            })
            .sort(function (a, b) {
                return a.sortWeight - b.sortWeight;
            })
            .map(function (c) {
                return [c.columnId, c.sortDir];
            });
    };
    ColumnGroupStore.prototype.isLastVisible = function (column) {
        return this.visibleColumns.at(-1) === column;
    };
    return ColumnGroupStore;
})();
exports.ColumnGroupStore = ColumnGroupStore;
