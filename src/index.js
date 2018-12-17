const R = require("ramda");
const fs = require("fs");
const OUTPUT = require("./IO").OUTPUT;
const {
  arrayOfTagIdAndTitleToObjWithTagIDAsKey,
  arrayOfNoteIDAndTagIDTo_TagIDWithAccordingNoteIDs,
  notesToIdAsKey,
  combineDetail,
  toMindMapTree,
  toMarkdown
} = require("./transformer");
const { AppDAO } = require("./dao");

const dao = new AppDAO();

const tagIDWithAccordingNoteIDsPromise = R.then(
  arrayOfNoteIDAndTagIDTo_TagIDWithAccordingNoteIDs,
  dao.all(
    "SELECT Z_6NOTES AS noteID, Z_13TAGS AS tagID FROM Z_6TAGS " +
      "WHERE Z_6NOTES NOT IN (SELECT Z_PK FROM ZSFNOTE WHERE ZARCHIVED=1 or ZTRASHED=1)"
  )
);

const tagIDToTitlePromise = R.then(
  arrayOfTagIdAndTitleToObjWithTagIDAsKey,
  dao.all("SELECT Z_PK AS tagID, ZTITLE AS title FROM ZSFNOTETAG")
);

const noteIDToDetailPromise = R.then(
  notesToIdAsKey,
  dao.all(
    "SELECT Z_PK AS noteID, ZTITLE AS title, ZUNIQUEIDENTIFIER AS identifier FROM ZSFNOTE"
  )
);

Promise.all([
  tagIDWithAccordingNoteIDsPromise,
  tagIDToTitlePromise,
  noteIDToDetailPromise
])
  .then(([tagIDWithAccordingNoteIDs, tagIDToTitle, noteIDToDetail]) =>
    combineDetail(tagIDWithAccordingNoteIDs, tagIDToTitle, noteIDToDetail)
  )
  .then(
    R.compose(
      content => fs.writeFile(OUTPUT, content, err => console.log(err || "Succeed!")),
      R.concat("# Bear\n\n"),
      toMarkdown,
      toMindMapTree
    )
  );
