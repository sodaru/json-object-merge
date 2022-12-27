import { cloneDeep } from "lodash";
import JSONObjectMerge, { Operation } from "../src";

type TestDataEntry = [
  string,
  unknown,
  unknown,
  unknown,
  Record<string, Operation> | undefined
];

const testFunc = (
  title: string,
  target: unknown,
  source: unknown,
  expected: unknown,
  rules?: Record<string, Operation>
) => {
  const originalTarget = cloneDeep(target);
  const originalSource = cloneDeep(source);
  expect(JSONObjectMerge(target, source, rules)).toStrictEqual(expected);
  expect(target).toStrictEqual(originalTarget);
  expect(source).toStrictEqual(originalSource);
};

describe("Test the merge for primitive types: ", () => {
  const testData: TestDataEntry[] = [
    ["string with string", "Hello", "World", "World", undefined],
    ["string with number", "Hello", 1, 1, undefined],
    ["string with boolean", "Hello", true, true, undefined],
    ["string with null", "Hello", null, null, undefined],
    ["string with array", "Hello", [1, 2, 3], [1, 2, 3], undefined],
    // prettier-ignore
    ["string with object", "Hello", { name: "json-object-merge" }, { name: "json-object-merge" }, undefined],

    ["number with string", 10.5, "World", "World", undefined],
    ["number with number", 10.5, 1, 1, undefined],
    ["number with boolean", 10.5, true, true, undefined],
    ["number with null", 10.5, null, null, undefined],
    ["number with array", 10.5, [1, 2, 3], [1, 2, 3], undefined],
    // prettier-ignore
    ["string with object", 10.5, { name: "json-object-merge" }, { name: "json-object-merge" }, undefined],

    ["boolean with string", true, "World", "World", undefined],
    ["boolean with number", false, 1, 1, undefined],
    ["boolean with boolean", true, true, true, undefined],
    ["boolean with null", false, null, null, undefined],
    ["number with array", true, [1, 2, 3], [1, 2, 3], undefined],
    // prettier-ignore
    ["string with object", false, { name: "json-object-merge" }, { name: "json-object-merge" }, undefined],

    ["null with string", null, "World", "World", undefined],
    ["null with number", null, 1, 1, undefined],
    ["null with boolean", null, true, true, undefined],
    ["null with null", null, null, null, undefined],
    ["number with array", null, [1, 2, 3], [1, 2, 3], undefined],
    // prettier-ignore
    ["string with object", null, { name: "json-object-merge" }, { name: "json-object-merge" }, undefined]
  ];
  test.each(testData)("%s", testFunc);
});

describe("Test the merge for object type: ", () => {
  const testData: TestDataEntry[] = [
    ["with primitive", {}, "World", "World", undefined],
    ["with array", {}, ["World"], ["World"], undefined],

    [
      "with object",
      { name: "Hello" },
      { name: "World" },
      { name: "World" },
      undefined
    ],

    [
      "with object having overriding and extra properties",
      { name: "hello", version: 1 },
      { name: "HELLO", title: "WORLD" },
      { name: "HELLO", version: 1, title: "WORLD" },
      undefined
    ],

    [
      "with object having overriding and extra properties and custom rule set to REPLACE",
      { name: "hello", version: 1 },
      { name: "HELLO", title: "WORLD" },
      { name: "HELLO", title: "WORLD" },
      { $: "REPLACE" }
    ],

    [
      "with object and custom rule set to APPEND (unsupported operation for object)",
      { name: "hello", version: 1 },
      { name: "HELLO", title: "WORLD" },
      { name: "HELLO", version: 1, title: "WORLD" }, // COMBINE is applied for unsupported operations
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
      { "$..books": "REPLACE" }
    ]
  ];
  test.each(testData)("%s", testFunc);
});

describe("Test the merge for array type: ", () => {
  const testData: TestDataEntry[] = [
    ["with primitive", [], 1000, 1000, undefined],
    ["with object", [], { name: "Hello" }, { name: "Hello" }, undefined],

    ["with array", ["Hello"], ["World"], ["World"], undefined],

    [
      "with array having extra properties",
      ["Hello"],
      ["HELLO", "World"],
      ["HELLO", "World"],
      undefined
    ],

    [
      "with array having objects and extra properties",
      [{ name: "Hello", version: 1 }],
      [{ name: "HELLO" }, "World"],
      [{ name: "HELLO", version: 1 }, "World"],
      undefined
    ],

    [
      "with array having overriding and extra properties and custom rule set to REPLACE",
      [{ name: "Hello", version: 1 }],
      [{ name: "HELLO" }, "World"],
      [{ name: "HELLO" }, "World"],
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
      },
      {
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
      },
      {
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
      },
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
      },
      { "$.store.book": "PREPEND" }
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
      undefined
    ]
  ];
  test.each(testData)("%s", testFunc);
});
