/**
 * @file Elisptred grammar for tree-sitter
 * @author Ben Vandervalk <ben.vvalk@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "elisptred",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
