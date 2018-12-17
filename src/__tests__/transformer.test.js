const {
  arrayOfTagIdAndTitleToObjWithTagIDAsKey,
  arrayOfNoteIDAndTagIDTo_TagIDWithAccordingNoteIDs,
  notesToIdAsKey,
  combineDetail,
  toMindMapTree,
  toMarkdown
} = require("../transformer");

describe("tagIDToTitle", () => {
  it("should transform", () => {
    const data = [
      { tagID: 111, title: "hello" },
      { tagID: 222, title: "world" }
    ];
    const expected = { 111: "hello", 222: "world" };

    expect(arrayOfTagIdAndTitleToObjWithTagIDAsKey(data)).toEqual(expected);
  });
});

describe("arrayOfNoteIDAndTagIDTo_TagIDWithAccordingNoteIDs", () => {
  it("should transform", () => {
    const data = [
      { noteID: 1, tagID: 111 },
      { noteID: 2, tagID: 111 },
      { noteID: 2, tagID: 222 }
    ];
    const expected = { 111: [1, 2], 222: [2] };

    expect(arrayOfNoteIDAndTagIDTo_TagIDWithAccordingNoteIDs(data)).toEqual(
      expected
    );
  });
});

describe("notesToIdAsKey", () => {
  it("should transform", () => {
    const data = [
      { noteID: 1, title: "hello", identifier: "123" },
      { noteID: 2, title: "world", identifier: "321" }
    ];
    const expected = {
      1: { noteID: 1, title: "hello", identifier: "123" },
      2: { noteID: 2, title: "world", identifier: "321" }
    };

    expect(notesToIdAsKey(data)).toEqual(expected);
  });
});

describe("combineDetail", () => {
  it("should combineDetail", () => {
    expect(
      combineDetail(
        { 1: [111, 222], 2: [222, 333] },
        { 1: "frontend", 2: "backend" },
        {
          111: { noteID: 111, title: "hello", identifier: "ABC" },
          222: { noteID: 222, title: "world", identifier: "ZXC" },
          333: { noteID: 333, title: "new", identifier: "SSS" }
        }
      )
    ).toEqual({
      frontend: [
        { title: "hello", identifier: "ABC" },
        { title: "world", identifier: "ZXC" }
      ],
      backend: [
        { title: "world", identifier: "ZXC" },
        { title: "new", identifier: "SSS" }
      ]
    });
  });
});

describe("toMindMapTree", () => {
  it("should construct a tree using tag", () => {
    const input = {
      "frontend/react": [
        { title: "HOC", identifier: "AAA" },
        { title: "Hooks", identifier: "BBB" }
      ],
      "frontend/react/test": [{ title: "test", identifier: "ZZZ" }],
      "frontend/vue": [{ title: "template", identifier: "CCC" }],
      "frontend/": [{ title: "js", identifier: "DDD" }],
      backend: [{ title: "rest", identifier: "EEE" }]
    };
    const expected = {
      tag: {
        frontend: {
          notes: [{ title: "js", identifier: "DDD" }],
          tag: {
            react: {
              tag: { test: { notes: [{ title: "test", identifier: "ZZZ" }] } },
              notes: [
                { title: "HOC", identifier: "AAA" },
                { title: "Hooks", identifier: "BBB" }
              ]
            },
            vue: {
              notes: [{ title: "template", identifier: "CCC" }]
            }
          }
        },
        backend: {
          notes: [{ title: "rest", identifier: "EEE" }]
        }
      }
    };

    expect(toMindMapTree(input)).toEqual(expected);
  });
});

describe("toMarkdown", () => {
  it("should transform to markdown", () => {
    const input = {
      tag: {
        one: {
          tag: {
            two: {
              tag: {
                three: {
                  notes: [
                    { title: "three", identifier: "three" },
                    { title: "three2", identifier: "three2" }
                  ],
                  tag: {
                    four: {
                      tag: {
                        five: { notes: [{ title: "five", identifier: "five" }] }
                      },
                      notes: [{ title: "four", identifier: "four" }]
                    }
                  }
                }
              },
              notes: [{ title: "two", identifier: "two" }]
            },
            vue: {
              notes: [{ title: "vue", identifier: "vue" }]
            }
          }
        }
      }
    };

    const expected = `## one

### two

- [two](bear://x-callback-url/open-note?id=two)

- three

	- [three](bear://x-callback-url/open-note?id=three)

	- [three2](bear://x-callback-url/open-note?id=three2)

	- four

		- [four](bear://x-callback-url/open-note?id=four)

		- five

			- [five](bear://x-callback-url/open-note?id=five)

### vue

- [vue](bear://x-callback-url/open-note?id=vue)`;
    expect(toMarkdown(input)).toEqual(expected);
  });
});
