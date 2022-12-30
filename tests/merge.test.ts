import { cloneDeep } from "lodash";
import JSONObjectMerge, {
  Operation,
  MergeReport,
  MergedWithReport
} from "../src";

type TestDataEntry = [
  string, // title
  unknown, // target
  unknown, // source
  unknown, // merged
  MergeReport[], // report
  Record<string, Operation> | undefined // rules
];

const testFunc = (
  title: string,
  target: unknown,
  source: unknown,
  expected: unknown,
  updatedPaths: MergeReport[],
  rules?: Record<string, Operation>
) => {
  const originalTarget = cloneDeep(target);
  const originalSource = cloneDeep(source);
  expect(JSONObjectMerge(target, source, rules)).toStrictEqual(expected);
  expect(target).toStrictEqual(originalTarget);
  expect(source).toStrictEqual(originalSource);

  expect(JSONObjectMerge(target, source, rules, true)).toStrictEqual({
    merged: expected,
    report: { updatedPaths }
  } as MergedWithReport);
};

describe("Test the merge for primitive types: ", () => {
  const testData: TestDataEntry[] = [
    [
      "string with string",
      "Hello",
      "World",
      "World",
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    [
      "string with number",
      "Hello",
      1,
      1,
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    [
      "string with boolean",
      "Hello",
      true,
      true,
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    [
      "string with null",
      "Hello",
      null,
      null,
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    [
      "string with array",
      "Hello",
      [1, 2, 3],
      [1, 2, 3],
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    // prettier-ignore
    ["string with object", "Hello", { name: "json-object-merge" }, { name: "json-object-merge" }, [{path: ["$"], operation: "REPLACE"}],undefined],

    [
      "number with string",
      10.5,
      "World",
      "World",
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    [
      "number with number",
      10.5,
      1,
      1,
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    [
      "number with boolean",
      10.5,
      true,
      true,
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    [
      "number with null",
      10.5,
      null,
      null,
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    [
      "number with array",
      10.5,
      [1, 2, 3],
      [1, 2, 3],
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    // prettier-ignore
    ["string with object", 10.5, { name: "json-object-merge" }, { name: "json-object-merge" },[{path: ["$"], operation: "REPLACE"}], undefined],

    [
      "boolean with string",
      true,
      "World",
      "World",
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    [
      "boolean with number",
      false,
      1,
      1,
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    [
      "boolean with boolean",
      true,
      true,
      true,
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    [
      "boolean with null",
      false,
      null,
      null,
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    [
      "number with array",
      true,
      [1, 2, 3],
      [1, 2, 3],
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    // prettier-ignore
    ["string with object", false, { name: "json-object-merge" }, { name: "json-object-merge" }, [{path: ["$"], operation: "REPLACE"}],undefined],

    [
      "null with string",
      null,
      "World",
      "World",
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    [
      "null with number",
      null,
      1,
      1,
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    [
      "null with boolean",
      null,
      true,
      true,
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    [
      "null with null",
      null,
      null,
      null,
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    [
      "number with array",
      null,
      [1, 2, 3],
      [1, 2, 3],
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    // prettier-ignore
    ["string with object", null, { name: "json-object-merge" }, { name: "json-object-merge" }, [{path: ["$"], operation: "REPLACE"}],undefined]
  ];
  test.each(testData)("%s", testFunc);
});

describe("Test the merge for object type: ", () => {
  const testData: TestDataEntry[] = [
    [
      "with primitive",
      {},
      "World",
      "World",
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    [
      "with array",
      {},
      ["World"],
      ["World"],
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],

    [
      "with object",
      { name: "Hello" },
      { name: "World" },
      { name: "World" },
      [{ path: ["$", "name"], operation: "REPLACE" }],
      undefined
    ],

    [
      "with object having overriding and extra properties",
      { name: "hello", version: 1 },
      { name: "HELLO", title: "WORLD" },
      { name: "HELLO", version: 1, title: "WORLD" },
      [
        { path: ["$", "title"], operation: "COMBINE" },
        { path: ["$", "name"], operation: "REPLACE" }
      ],
      undefined
    ],

    [
      "with object having overriding and extra properties and custom rule set to REPLACE",
      { name: "hello", version: 1 },
      { name: "HELLO", title: "WORLD" },
      { name: "HELLO", title: "WORLD" },
      [{ path: ["$"], operation: "REPLACE" }],
      { $: "REPLACE" }
    ],

    [
      "with object and custom rule set to APPEND (unsupported operation for object)",
      { name: "hello", version: 1 },
      { name: "HELLO", title: "WORLD" },
      { name: "HELLO", version: 1, title: "WORLD" }, // COMBINE is applied for unsupported operations
      [
        { path: ["$", "title"], operation: "COMBINE" },
        { path: ["$", "name"], operation: "REPLACE" }
      ],
      { $: "APPEND" }
    ],

    [
      "with object and custom rule set to REPLACE for deep property",
      {
        store: {
          books: [
            {
              title: "Sayings of the Century",
              price: 8.95
            },
            {
              title: "Sword of Honour",
              price: 12.99
            }
          ]
        },
        bicycle: {
          color: "red"
        }
      },
      {
        store: {
          books: [
            {
              title: "Moby Dick",
              isbn: "0-553-21311-3",
              price: 8.99
            },
            {
              title: "Sword of Honour",
              price: 12.99
            },
            {
              title: "The Lord of the Rings",
              price: 22.99
            }
          ]
        },
        bicycle: {
          price: 19.95
        }
      },
      {
        store: {
          books: [
            {
              title: "Moby Dick",
              isbn: "0-553-21311-3",
              price: 8.99
            },
            {
              title: "Sword of Honour",
              price: 12.99
            },
            {
              title: "The Lord of the Rings",
              price: 22.99
            }
          ]
        },
        bicycle: {
          color: "red",
          price: 19.95
        }
      },
      [
        { path: ["$", "bicycle", "price"], operation: "COMBINE" },
        { path: ["$", "store", "books"], operation: "REPLACE" }
      ],
      { "$..books": "REPLACE" }
    ]
  ];
  test.each(testData)("%s", testFunc);
});

describe("Test the merge for array type: ", () => {
  const testData: TestDataEntry[] = [
    [
      "with primitive",
      [],
      1000,
      1000,
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],
    [
      "with object",
      [],
      { name: "Hello" },
      { name: "Hello" },
      [{ path: ["$"], operation: "REPLACE" }],
      undefined
    ],

    [
      "with array",
      ["Hello"],
      ["World"],
      ["World"],
      [{ path: ["$", 0], operation: "REPLACE" }],
      undefined
    ],

    [
      "with array having extra properties",
      ["Hello"],
      ["HELLO", "World"],
      ["HELLO", "World"],
      [
        { path: ["$", 1], operation: "COMBINE" },
        { path: ["$", 0], operation: "REPLACE" }
      ],
      undefined
    ],

    [
      "with array having objects and extra properties",
      [{ name: "Hello", version: 1 }],
      [{ name: "HELLO" }, "World"],
      [{ name: "HELLO", version: 1 }, "World"],
      [
        { path: ["$", 1], operation: "COMBINE" },
        { path: ["$", 0, "name"], operation: "REPLACE" }
      ],
      undefined
    ],

    [
      "with array having overriding and extra properties and custom rule set to REPLACE",
      [{ name: "Hello", version: 1 }],
      [{ name: "HELLO" }, "World"],
      [{ name: "HELLO" }, "World"],
      [{ path: ["$"], operation: "REPLACE" }],
      { $: "REPLACE" }
    ],

    [
      "with array and custom rule set to REPLACE for deep property",
      [
        {
          store: {
            books: [
              {
                title: "Sayings of the Century",
                price: 8.95
              },
              {
                title: "Sword of Honour",
                price: 12.99
              }
            ]
          },
          bicycle: {
            color: "red"
          }
        }
      ],
      [
        {
          store: {
            books: [
              {
                title: "Moby Dick",
                isbn: "0-553-21311-3",
                price: 8.99
              },
              {
                title: "Sword of Honour",
                price: 12.99
              },
              {
                title: "The Lord of the Rings",
                price: 22.99
              }
            ]
          },
          bicycle: {
            price: 19.95
          }
        }
      ],
      [
        {
          store: {
            books: [
              {
                title: "Moby Dick",
                isbn: "0-553-21311-3",
                price: 8.99
              },
              {
                title: "Sword of Honour",
                price: 12.99
              },
              {
                title: "The Lord of the Rings",
                price: 22.99
              }
            ]
          },
          bicycle: {
            color: "red",
            price: 19.95
          }
        }
      ],
      [
        { path: ["$", 0, "bicycle", "price"], operation: "COMBINE" },
        { path: ["$", 0, "store", "books"], operation: "REPLACE" }
      ],
      { "$..books": "REPLACE" }
    ]
  ];
  test.each(testData)("%s", testFunc);
});

describe("Test the merge for mixed object: ", () => {
  const testData: TestDataEntry[] = [
    [
      "without custom rules",
      {
        store: {
          books: [
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
      },
      {
        store: {
          books: [
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
      },
      {
        store: {
          // object is merged recursively
          books: [
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
      },
      [
        { path: ["$", "store", "books", 1], operation: "COMBINE" },
        { path: ["$", "store", "books", 0, "isbn"], operation: "COMBINE" },
        { path: ["$", "store", "books", 0, "price"], operation: "REPLACE" }
      ],
      undefined
    ],
    [
      "with custom rules",
      {
        store: {
          book: [
            {
              category: "reference",
              author: "Nigel Rees",
              title: "Sayings of the Century",
              price: 8.95
            }
          ],
          bicycle: [
            {
              color: "red",
              price: 19.95
            }
          ]
        }
      },
      {
        store: {
          book: [
            {
              category: "fiction",
              author: "Evelyn Waugh",
              title: "Sword of Honour",
              isbn: "0-679-43136-5",
              price: 12.99
            }
          ],
          bicycle: [
            {
              color: "green",
              price: 20.55
            },
            {
              color: "blue",
              price: 18.4
            }
          ]
        }
      },
      {
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
          bicycle: [
            {
              color: "red",
              price: 19.95
            },
            {
              color: "green",
              price: 20.55
            },
            {
              color: "blue",
              price: 18.4
            }
          ]
        }
      },
      [
        { path: ["$", "store", "book"], operation: "PREPEND", count: 1 },
        { path: ["$", "store", "bicycle"], operation: "APPEND", count: 2 }
      ],
      { "$.store.book": "PREPEND", "$..bicycle": "APPEND" }
    ],
    [
      "with special characters in custom rules",
      {
        store: {
          book: [
            {
              "SODARU::category": "reference",
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
      },
      {
        store: {
          book: [
            {
              "SODARU::category": "fiction",
              author: "Evelyn Waugh",
              title: "Sword of Honour",
              isbn: "0-679-43136-5",
              price: 12.99
            }
          ]
        }
      },
      {
        store: {
          book: [
            {
              "SODARU::category": "fiction",
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
      },
      [{ path: ["$", "store", "book", 0], operation: "REPLACE" }],
      { "$..[?(@['SODARU::category'])]": "REPLACE" }
    ],
    [
      "with special characters in property names",
      {
        "my-store": {
          book: [
            {
              "SODARU::category": "reference",
              author: "Nigel Rees",
              title: "Sayings of the Century",
              price: 8.95
            }
          ],
          "bi.cycle": {
            color: "red",
            "total price": 19.95
          }
        }
      },
      {
        "my-store": {
          book: [
            {
              "SODARU::category": "fiction",
              author: "Evelyn Waugh",
              title: "Sword of Honour",
              "'isbn'": "0-679-43136-5",
              price: 12.99
            }
          ]
        }
      },
      {
        "my-store": {
          book: [
            {
              "SODARU::category": "fiction",
              author: "Evelyn Waugh",
              title: "Sword of Honour",
              "'isbn'": "0-679-43136-5",
              price: 12.99
            }
          ],
          "bi.cycle": {
            color: "red",
            "total price": 19.95
          }
        }
      },
      [
        { path: ["$", "my-store", "book", 0, "'isbn'"], operation: "COMBINE" },
        {
          path: ["$", "my-store", "book", 0, "SODARU::category"],
          operation: "REPLACE"
        },
        { path: ["$", "my-store", "book", 0, "author"], operation: "REPLACE" },
        { path: ["$", "my-store", "book", 0, "title"], operation: "REPLACE" },
        { path: ["$", "my-store", "book", 0, "price"], operation: "REPLACE" }
      ],
      undefined
    ]
  ];
  test.each(testData)("%s", testFunc);
});
