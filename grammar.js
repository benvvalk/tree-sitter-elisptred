const COMMENT = token(/;.*/);

const STRING = token(
  seq('"', repeat(choice(/[^"\\]/, seq("\\", /(.|\n)/))), '"')
);

// Symbols can contain any character when escaped:
// https://www.gnu.org/software/emacs/manual/html_node/elisp/Symbol-Type.html
// Most characters do not need escaping, but space and parentheses
// certainly do.
//
// Symbols also cannot start with ?.
const SYMBOL = token(
  /([^?# \n\s\f()\[\]'`,\\";]|\\.)([^# \n\s\f()\[\]'`,\\";]|\\.)*/
);

const ESCAPED_READER_SYMBOL = token(/\\(`|'|,)/);
const INTERNED_EMPTY_STRING = token("##");

const INTEGER_BASE10 = token(/[+-]?[0-9]+\.?/);
const INTEGER_WITH_BASE = token(/#([box]|[0-9][0-9]?r)[0-9a-zA-Z]/);

const FLOAT_WITH_DEC_POINT = token(/[+-]?[0-9]*\.[0-9]+/);
const FLOAT_WITH_EXPONENT = token(/[+-]?[0-9]+[eE][0-9]+/);
const FLOAT_WITH_BOTH = token(/[+-]?[0-9]*\.[0-9]+[eE][0-9]+/);
const FLOAT_INF = token(/-?1.0[eE]\+INF/);
const FLOAT_NAN = token(/-?0.0[eE]\+NaN/);

const CHAR = token(/\?(\\.|.)/);
const UNICODE_NAME_CHAR = token(/\?\\N\{[^}]+\}/);
const LOWER_CODE_POINT_CHAR = token(/\?\\u[0-9a-fA-F]{4}/);
const UPPER_CODE_POINT_CHAR = token(/\?\\U[0-9a-fA-F]{8}/);
const HEX_CHAR = token(/\?\\x[0-9a-fA-F]+/);
const OCTAL_CHAR = token(/\?\\[0-7]{1,3}/);

// E.g. ?\C-o or ?\^o or ?\C-\S-o
const KEY_CHAR = token(/\?(\\(([CMSHsA]-)|\^))+(\\;|.)/);
// E.g. ?\M-\123
const META_OCTAL_CHAR = token(/\?\\M-\\[0-9]{1,3}/);

// https://www.gnu.org/software/emacs/manual/html_node/elisp/Special-Read-Syntax.html
const BYTE_COMPILED_FILE_NAME = token("#$");

const HORIZONTAL_WHITESPACE = token(/[ \t|\f]+/);
const NEWLINE = token("\n");

module.exports = grammar({
  name: "elisptred",

  extras: ($) => [$.comment],

  rules: {
    source_file: ($) =>
      seq(
        optional($._whitespace),
        repeat(seq($._sexp, optional($._whitespace))),
      ),

    _whitespace: ($) => repeat1(choice($.horizontal_whitespace, $.newline)),

    horizontal_whitespace: ($) => HORIZONTAL_WHITESPACE,
    newline: ($) => NEWLINE,

    _sexp: ($) =>
      choice(
        $.list,
        $.vector,
        $.hash_table,
        $.bytecode,
        $.string_text_properties,
        $._atom,
        $.quote,
        $.unquote_splice,
        $.unquote
      ),
    
    _atom: ($) =>
      choice(
        $.float,
        $.integer,
        $.char,
        $.string,
        $.byte_compiled_file_name,
        $.symbol
      ),
    float: ($) =>
      choice(
        FLOAT_WITH_DEC_POINT,
        FLOAT_WITH_EXPONENT,
        FLOAT_WITH_BOTH,
        FLOAT_INF,
        FLOAT_NAN
      ),
    integer: ($) => choice(INTEGER_BASE10, INTEGER_WITH_BASE),
    char: ($) =>
      choice(
        CHAR,
        UNICODE_NAME_CHAR,
        LOWER_CODE_POINT_CHAR,
        UPPER_CODE_POINT_CHAR,
        HEX_CHAR,
        OCTAL_CHAR,
        KEY_CHAR,
        META_OCTAL_CHAR
      ),
    string: ($) => STRING,
    byte_compiled_file_name: ($) => BYTE_COMPILED_FILE_NAME,
    symbol: ($) =>
      choice(
        // Match nil and t separately so we can highlight them.
        "nil",
        "t",
        // We need to define these as separate tokens so we can handle
        // e.g '(defun) as a sexp. Without these, we just try
        // function_definition and produce a parse failure.
        "defun",
        "defsubst",
        "defmacro",
        ESCAPED_READER_SYMBOL,
        SYMBOL,
        INTERNED_EMPTY_STRING
      ),

    quote: ($) => seq(choice("#'", "'", "`"), $._sexp),
    unquote_splice: ($) => seq(",@", $._sexp),
    unquote: ($) => seq(",", $._sexp),

    dot: ($) => token("."),

    list: ($) =>
      seq(
        "(",
        optional($._whitespace),
        repeat(seq($._sexp, optional($._whitespace))),
        ")"
      ),

    vector: ($) =>
      seq(
        "[",
        optional($._whitespace),
        repeat(seq($._sexp, optional($._whitespace))),
        "]"
      ),

    bytecode: ($) =>
      seq(
        "#[",
        optional($._whitespace),
        repeat(seq($._sexp, optional($._whitespace))),
        "]"
      ),

    string_text_properties: ($) =>
      seq(
        "#(",
        $.string,
        optional($._whitespace),
        repeat(seq($._sexp, optional($._whitespace))),
        ")"
      ),

    hash_table: ($) =>
      seq(
        "#s(hash-table",
        optional($._whitespace),
        repeat(seq($._sexp, optional($._whitespace))),
        ")"
      ),

    comment: ($) => COMMENT,
  },
});