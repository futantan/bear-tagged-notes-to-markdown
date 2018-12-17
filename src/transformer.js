const R = require("ramda");

const arrayOfTagIdAndTitleToObjWithTagIDAsKey = R.compose(
  R.mergeAll,
  R.map(({ tagID, title }) => ({ [tagID]: title }))
);

const arrayOfNoteIDAndTagIDTo_TagIDWithAccordingNoteIDs = R.reduceBy(
  (acc, { noteID }) => acc.concat(noteID),
  [],
  R.prop("tagID")
);

const notesToIdAsKey = R.compose(
  R.map(R.head),
  R.groupBy(R.prop("noteID"))
);

const combineDetail = (
  tagIDWithAccordingNoteIDs,
  tagIDWithTitle,
  noteIDWithDetail
) => {
  const toNote = R.compose(
    R.pick(["title", "identifier"]),
    R.prop(R.__, noteIDWithDetail)
  );
  return R.compose(
    R.fromPairs,
    R.map(([tagID, noteIDs]) => [
      tagIDWithTitle[tagID],
      R.map(toNote, noteIDs)
    ]),
    R.toPairs
  )(tagIDWithAccordingNoteIDs);
};

const toMindMapTree = tagWithNotes => {
  const toTags = R.compose(
    R.reject(R.isEmpty),
    R.split("/")
  );
  const toTreePath = R.compose(
    R.prepend("tag"),
    R.append("notes"),
    R.intersperse("tag")
  );
  const tagTransformer = R.compose(
    toTreePath,
    toTags
  );
  return R.compose(
    R.reduce((prev, [path, notes]) => R.assocPath(path, notes, prev), {}),
    R.map(([tag, notes]) => [tagTransformer(tag), notes]),
    R.toPairs
  )(tagWithNotes);
};

const indent = (depth, content) => {
  if (R.isEmpty(content)) {
    return "";
  }
  if (depth < 2) {
    return R.compose(
      R.join(""),
      R.append(` ${content}`),
      () => R.repeat("#", depth + 2)
    )();
  }
  return R.compose(
    R.join(""),
    R.append(`- ${content}`),
    () => R.repeat("\t", depth - 2)
  )();
};

const noteLink = (title, identifier) =>
  `[${title}](bear://x-callback-url/open-note?id=${identifier})`;

const renderNotes = (notes, depth) => {
  return R.compose(
    R.join("\n\n"),
    R.map(R.curry(indent)(depth)),
    R.map(({ title, identifier }) => noteLink(title, identifier))
  )(notes);
};

const joinLines = R.compose(
  R.join("\n\n"),
  R.reject(R.isEmpty)
);

const toMarkdown = (mindMapTree, tagName = "", depth = -1) => {
  if (mindMapTree.tag === undefined && mindMapTree.notes === undefined) {
    return "";
  }
  const nextNodeRender = ([nextTagName, nextTree]) =>
    toMarkdown(nextTree, nextTagName, depth + 1);

  const tagContent = R.compose(
    joinLines,
    R.ifElse(R.isEmpty, R.always(""), R.map(nextNodeRender)),
    R.toPairs,
    R.propOr({}, "tag")
  )(mindMapTree);
  return joinLines([
    indent(depth, tagName),
    renderNotes(R.propOr([], "notes", mindMapTree), depth + 1),
    tagContent
  ]);
};

module.exports.arrayOfTagIdAndTitleToObjWithTagIDAsKey = arrayOfTagIdAndTitleToObjWithTagIDAsKey;
module.exports.arrayOfNoteIDAndTagIDTo_TagIDWithAccordingNoteIDs = arrayOfNoteIDAndTagIDTo_TagIDWithAccordingNoteIDs;
module.exports.notesToIdAsKey = notesToIdAsKey;
module.exports.combineDetail = combineDetail;
module.exports.toMindMapTree = toMindMapTree;
module.exports.toMarkdown = toMarkdown;
