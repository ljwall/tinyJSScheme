module.exports = {
  SchemeAtom: SchemeAtom,
  SchemeString: SchemeString,
  SchemeBool: SchemeBool,
  SchemeNum: SchemeNum,
  SchemeList: SchemeList
};

function SchemeAtom (val) { this.val = val; }
function SchemeString (val) { this.val = val; }
function SchemeBool (val) { this.val = val; }
function SchemeNum (val) { this.val = val; }
function SchemeList (val) { this.val = val; }
