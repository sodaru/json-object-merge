/* eslint-disable import/no-named-as-default-member */
import jp from "jsonpath";
import { cloneDeep, isArray, isPlainObject } from "lodash";

export type Operation = "REPLACE" | "COMBINE" | "APPEND" | "PREPEND";

export const JSONObjectMerge = (
  target: unknown,
  source: unknown,
  rules: Record<string, Operation> = {}
): unknown => {
  const pathToOperationMap: Record<string, Operation> = {};
  for (const jsonPathExpression in rules) {
    const _paths = jp.paths(target, jsonPathExpression);
    for (const pathComponents of _paths) {
      pathComponents.shift();
      pathComponents.unshift("$", "data");
      pathToOperationMap[pathComponents.join(".")] = rules[jsonPathExpression];
    }
  }

  const result = { data: cloneDeep(target) };
  const sourceObj = { data: cloneDeep(source) };

  const pathQueue: string[] = ["$.data"];

  while (pathQueue.length > 0) {
    const currentPath = pathQueue.shift();

    const currentValue = jp.value(result, currentPath);
    const currentValueFromSource = jp.value(sourceObj, currentPath);

    let replace = false;

    if (isArray(currentValue)) {
      const operation = isArray(currentValueFromSource)
        ? pathToOperationMap[currentPath] || "COMBINE"
        : "REPLACE";

      switch (operation) {
        case "REPLACE":
          replace = true;
          break;
        case "APPEND":
          currentValue.push(...currentValueFromSource);
          break;
        case "PREPEND":
          currentValue.unshift(...currentValueFromSource);
          break;
        default:
          for (let i = 0; i < currentValue.length; i++) {
            pathQueue.push(`${currentPath}.${i}`);
          }
          for (
            let i = currentValue.length;
            i < currentValueFromSource.length;
            i++
          ) {
            currentValue.push(currentValueFromSource[i]);
          }
      }
    } else if (isPlainObject(currentValue)) {
      const operation = isPlainObject(currentValueFromSource)
        ? pathToOperationMap[currentPath] || "COMBINE"
        : "REPLACE";

      switch (operation) {
        case "REPLACE":
          replace = true;
          break;
        default:
          for (const property in currentValue) {
            pathQueue.push(`${currentPath}.${property}`);
          }
          for (const property in currentValueFromSource) {
            if (currentValue[property] === undefined) {
              currentValue[property] = currentValueFromSource[property];
            }
          }
      }
    } else {
      replace = true;
    }
    if (replace && currentValueFromSource !== undefined) {
      jp.value(result, currentPath, currentValueFromSource);
    }
  }

  return result.data;
};
