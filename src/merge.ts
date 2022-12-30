/* eslint-disable import/no-named-as-default-member */
import jp from "jsonpath";
import { cloneDeep, isArray, isPlainObject } from "lodash";

export type Operation = "REPLACE" | "COMBINE" | "APPEND" | "PREPEND";

export type PathSegment = string | number;

export type Path = PathSegment[];

export type MergeReport = {
  path: Path;
  operation: Operation;
  count?: number; // number of items appended/prepended for APPEND/PREPEND operations
};

export type MergedWithReport = {
  merged: unknown;
  report: {
    updatedPaths: MergeReport[];
  };
};

export const JSONObjectMerge = (
  target: unknown,
  source: unknown,
  rules: Record<string, Operation> = {},
  report = false
): unknown | MergedWithReport => {
  const pathToOperationMap: Record<string, Operation> = {};
  for (const jsonPathExpression in rules) {
    const _paths = jp.paths(target, jsonPathExpression);
    for (const pathComponents of _paths) {
      pathComponents.shift();
      pathComponents.unshift("$", "data");
      pathToOperationMap[jp.stringify(pathComponents)] =
        rules[jsonPathExpression];
    }
  }

  const result = { data: cloneDeep(target) };
  const sourceObj = { data: cloneDeep(source) };
  const updatedPaths: MergeReport[] = [];

  const pathQueue: Path[] = [["$", "data"]];

  while (pathQueue.length > 0) {
    const currentPath = pathQueue.shift();
    const currentPathStr = jp.stringify(currentPath);

    const currentValue = jp.value(result, currentPathStr);
    const currentValueFromSource = jp.value(sourceObj, currentPathStr);

    let replace = false;

    if (isArray(currentValue)) {
      const operation = isArray(currentValueFromSource)
        ? pathToOperationMap[currentPathStr] || "COMBINE"
        : "REPLACE";

      switch (operation) {
        case "REPLACE":
          replace = true;
          break;
        case "APPEND":
          if (report) {
            updatedPaths.push({
              path: currentPath,
              operation: "APPEND",
              count: currentValueFromSource.length
            });
          }
          currentValue.push(...currentValueFromSource);
          break;
        case "PREPEND":
          if (report) {
            updatedPaths.push({
              path: currentPath,
              operation: "PREPEND",
              count: currentValueFromSource.length
            });
          }
          currentValue.unshift(...currentValueFromSource);
          break;
        default:
          for (let i = 0; i < currentValue.length; i++) {
            pathQueue.push([...currentPath, i]);
          }
          for (
            let i = currentValue.length;
            i < currentValueFromSource.length;
            i++
          ) {
            currentValue.push(currentValueFromSource[i]);
            if (report) {
              updatedPaths.push({
                path: [...currentPath, i],
                operation: "COMBINE"
              });
            }
          }
      }
    } else if (isPlainObject(currentValue)) {
      const operation = isPlainObject(currentValueFromSource)
        ? pathToOperationMap[currentPathStr] || "COMBINE"
        : "REPLACE";

      switch (operation) {
        case "REPLACE":
          replace = true;
          break;
        default:
          for (const property in currentValue) {
            pathQueue.push([...currentPath, property]);
          }
          for (const property in currentValueFromSource) {
            if (currentValue[property] === undefined) {
              currentValue[property] = currentValueFromSource[property];
              if (report) {
                updatedPaths.push({
                  path: [...currentPath, property],
                  operation: "COMBINE"
                });
              }
            }
          }
      }
    } else {
      replace = true;
    }
    if (replace && currentValueFromSource !== undefined) {
      jp.value(result, currentPathStr, currentValueFromSource);
      if (report) {
        updatedPaths.push({
          path: [...currentPath],
          operation: "REPLACE"
        });
      }
    }
  }

  if (report) {
    return {
      merged: result.data,
      report: {
        updatedPaths: updatedPaths.map(updatedPath => {
          updatedPath.path = ["$", ...updatedPath.path.slice(2)];
          return updatedPath;
        })
      }
    };
  }

  return result.data;
};
