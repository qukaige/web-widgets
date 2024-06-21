"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortRulesToSortInstructions = exports.sortInstructionsToSortRules = exports.ColumnsSortingStore = void 0;
var mobx_1 = require("mobx");
var ColumnsSortingStore = /** @class */ (function () {
    function ColumnsSortingStore(initialRules) {
        this.rules = [];
        this.rules = initialRules;
        (0, mobx_1.makeObservable)(this, {
            rules: mobx_1.observable.struct,
            toggleSort: mobx_1.action
        });
    }
    ColumnsSortingStore.prototype.getDirection = function (columnId) {
        var ruleIndex = this.rules.findIndex(function (r) {
            return r[0] === columnId;
        });
        if (ruleIndex === -1) {
            return undefined;
        }
        var _a = this.rules.at(ruleIndex),
            dir = _a[1];
        return [dir, ruleIndex + 1];
    };
    ColumnsSortingStore.prototype.toggleSort = function (columnId) {
        var _a = this.rules[0],
            _b = _a === void 0 ? [] : _a,
            cId = _b[0],
            dir = _b[1];
        if (!cId || cId !== columnId) {
            // was not sorted or sorted by a different column
            this.rules = [[columnId, "asc"]];
            return;
        }
        if (dir === "asc") {
            // sorted by asc, flip to desc
            this.rules = [[columnId, "desc"]];
            return;
        }
        // sorted by desc, disable
        this.rules = [];
    };
    return ColumnsSortingStore;
})();
exports.ColumnsSortingStore = ColumnsSortingStore;
function sortInstructionsToSortRules(sortInstructions, allColumns) {
    if (!sortInstructions || !sortInstructions.length) {
        return [];
    }
    return sortInstructions
        .map(function (si) {
            var _a;
            var attrId = si[0],
                dir = si[1];
            var cId =
                (_a = allColumns.find(function (c) {
                    return c.attrId === attrId;
                })) === null || _a === void 0
                    ? void 0
                    : _a.columnId;
            if (!cId) {
                return undefined;
            }
            return [cId, dir];
        })
        .filter(function (r) {
            return !!r;
        });
}
exports.sortInstructionsToSortRules = sortInstructionsToSortRules;
function sortRulesToSortInstructions(sortRules, allColumns) {
    if (!sortRules.length) {
        return undefined;
    }
    return sortRules
        .map(function (rule) {
            var _a;
            var cId = rule[0],
                dir = rule[1];
            var attrId =
                (_a = allColumns.find(function (c) {
                    return c.columnId === cId;
                })) === null || _a === void 0
                    ? void 0
                    : _a.attrId;
            if (!attrId) {
                return undefined;
            }
            return [attrId, dir];
        })
        .filter(function (si) {
            return !!si;
        });
}
exports.sortRulesToSortInstructions = sortRulesToSortInstructions;
