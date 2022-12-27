# json-object-merge

Merge JSON Objects using rules

> More often we try to merge JSON objects into one. Even though this seems easy, many times it gets complicated. This library helps to recursively merge the JSON Objects based on rules. Rules give a hint on how to merge at each level of the JSON depth.

## Usage

```typescript
import JSONObjectMerge from "json-object-merge";

// in CommonJS environments
const JSONObjectMerge = require("json-object-merge");

// source is merged into target using rules and new object is returned
const merged = JSONObjectMerge(target, source, rules);

// when 4th parameter is true, returns the report containing the sourcePaths in the merged object
const mergedWithReport = JSONObjectMerge(target, source, rules, true);
```

`JSONObjectMerge` merges the source object recursively into the target object in the following manner.  
If source is

- `Primitive` type, the value is REPLACED with the value in the source.
- `Array`, each item of the array is recursively COMBINED with the item from the source array
- `Object`, each property is recursively COMBINED with the property from the source.

The default operation on `Array` and `Object` can be altered by specifying rules.

## Merge Operations

| Data Type | Operations                                                                                                                                                                                                      | Default Operation |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Primitive | REPLACE - The value is replaced                                                                                                                                                                                 | REPLACE           |
| Array     | REPLACE - The whole Array is relpaced <br/> COMBINE - The items are merged recursively <br/> APPEND - The source items are appended to the target <br/> PREPPEND - The source items are prepended to the target | COMBINE           |
| Object    | REPLACE - The whole Object is relpaced <br/> COMBINE - The properties are merged recursively                                                                                                                    | COMBINE           |

## Rules Definition

The `rules` parameter is a [JSON Path](https://www.npmjs.com/package/jsonpath) to the Operation map

For the sample JSON data mentioned at https://www.npmjs.com/package/jsonpath

```typescript
const rules = {
  "$.store.book[*].author": "REPLACE", // replaces auther of all books inside the store
  "$..book": "APPEND", // append to books array
  "$..bicycle": "COMBINE" // Merge the properties of bicycle
};
```

### Important considerations for rules

- The JSON path is evaluated on the `target` object, not the `source`
- If the type of value is not allowing the specified operation, then the default operation for the data type is used.

## Examples

1. Merge without any custom rules

```typescript
const target = {
  store: {
    book: [
      {
        category: "reference",
        author: "Nigel Rees",
        title: "Sayings of the Century",
        price: 8.95
      }
    ],
    bicycle: {
      color: "red",
      price: 19.95
    }
  }
};

const source = {
  store: {
    book: [
      {
        isbn: "0-044-40080-2",
        price: 9.05
      },
      {
        category: "fiction",
        author: "Evelyn Waugh",
        title: "Sword of Honour",
        isbn: "0-679-43136-5",
        price: 12.99
      }
    ]
  }
};
const merged = JSONObjectMerge(target, source);

expect(merged).toEqual({
  store: {
    // object is merged recursively
    book: [
      {
        // item at index 0 is merged
        category: "reference",
        author: "Nigel Rees",
        title: "Sayings of the Century",
        isbn: "0-044-40080-2", // isbn is added
        price: 9.05 // price is replaced
      },
      {
        // the new item is added
        category: "fiction",
        author: "Evelyn Waugh",
        title: "Sword of Honour",
        isbn: "0-679-43136-5",
        price: 12.99
      }
    ],
    bicycle: {
      color: "red",
      price: 19.95
    }
  }
});
```

2. Merge with rules

```typescript
const target = {
  store: {
    book: [
      {
        category: "reference",
        author: "Nigel Rees",
        title: "Sayings of the Century",
        price: 8.95
      }
    ],
    bicycle: {
      color: "red",
      price: 19.95
    }
  }
};

const source = {
  store: {
    book: [
      {
        category: "fiction",
        author: "Evelyn Waugh",
        title: "Sword of Honour",
        isbn: "0-679-43136-5",
        price: 12.99
      }
    ]
  }
};
const merged = JSONObjectMerge(target, source, { "$.store.book": "PREPEND" });

expect(merged).toEqual({
  store: {
    book: [
      {
        // books from source are prepended to the original array
        category: "fiction",
        author: "Evelyn Waugh",
        title: "Sword of Honour",
        isbn: "0-679-43136-5",
        price: 12.99
      },
      {
        category: "reference",
        author: "Nigel Rees",
        title: "Sayings of the Century",
        price: 8.95
      }
    ],
    bicycle: {
      color: "red",
      price: 19.95
    }
  }
});
```

3. Merge with report

JSONObjectMerge returns the report containing paths in the merged object which are originally from the source

```typescript
const target = {
  store: {
    bicycle: {
      color: "red"
    }
  }
};

const source = {
  store: {
    bicycle: {
      price: 19.95
    }
  }
};

const mergedWithReport = JSONObjectMerge(target, source, undefined, true);

expect(merged).toEqual({
  merged: {
    store: {
      bicycle: {
        color: "red",
        price: 19.95
      }
    }
  },
  report: { sourcePaths: [["$", "store", "bicycle", "price"]] }
});
```

## Contribution

Fork the repo and send the Pull Requests to `develop` branch

`develop` is merged to the main `branch` periodically to make a **release**

## Support

This project is a part of the Open Source Initiative from [Sodaru Technologies](https://sodaru.com).

Write an email to opensource@sodaru.com for queries on this project
