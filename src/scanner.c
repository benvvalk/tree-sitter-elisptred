// This is an "external scanner" for the tree-sitter grammar.
//
// External scanner are used for parsing logic that is
// difficult/impossible to implement using regular expressions
// simple look-ahead parsing.
//
// Tree-sitter documentation:
// https://tree-sitter.github.io/tree-sitter/creating-parsers/4-external-scanners.html

#include <stdint.h>

#include "tree_sitter/parser.h"
#include "tree_sitter/alloc.h"
#include "tree_sitter/array.h"

enum TokenType {
    WHITESPACE_HORIZONTAL,
    WHITESPACE_BLANK_LINE,
    WHITESPACE_NEWLINE
};

typedef struct {
    bool beginning_of_file;
} ScannerState;

void* tree_sitter_elisptred_external_scanner_create() {
    ScannerState* scanner_state = ts_calloc(1, sizeof(ScannerState));
    scanner_state->beginning_of_file = true;
    return scanner_state;
}

void tree_sitter_elisptred_external_scanner_destroy(void* payload) {
    ts_free(payload);
}

unsigned tree_sitter_elisptred_external_scanner_serialize(
    void* payload,
    char* buffer
) {
    ScannerState* scanner_state = (ScannerState*)payload;
    buffer[0] = (char)scanner_state->beginning_of_file;
    return 1;
}

void tree_sitter_elisptred_external_scanner_deserialize(
  void* payload,
  const char* buffer,
  unsigned length
) {
    ScannerState* scanner_state = (ScannerState*)payload;
    if (length > 0) {
        scanner_state->beginning_of_file = (bool)buffer[0];
    } else {
        scanner_state->beginning_of_file = true;
    }
}

bool tree_sitter_elisptred_external_scanner_scan(
  void *payload,
  TSLexer *lexer,
  const bool *valid_symbols
) {
    // Assumption: It should never occur that a subset of the
    // whitespace symbols are valid; either they will all be valid or
    // none them will be valid.
    bool all_whitespace_valid = valid_symbols[WHITESPACE_HORIZONTAL]
        && valid_symbols[WHITESPACE_BLANK_LINE]
        && valid_symbols[WHITESPACE_NEWLINE];

    if (all_whitespace_valid) {
        ScannerState* scanner_state = (ScannerState*)payload;
        bool beginning_of_file = scanner_state->beginning_of_file;
        scanner_state->beginning_of_file = false;

        bool start_char_was_newline = false;
        bool lexer_was_advanced = false;
        if (lexer->lookahead == '\n') {
            if (beginning_of_file) {
                lexer->result_symbol = WHITESPACE_BLANK_LINE;
                return true;
            } else {
                start_char_was_newline = true;
                lexer->advance(lexer, false);
                lexer_was_advanced = true;
            }
        }

        while (!lexer->eof(lexer)) {
            if (strchr(" \t\f", lexer->lookahead)) {
                lexer->advance(lexer, false);
                lexer_was_advanced = true;
            } else if (lexer->lookahead == '\n') {
                if (start_char_was_newline || beginning_of_file) {
                    lexer->result_symbol = WHITESPACE_BLANK_LINE;
                } else if (!lexer_was_advanced) {
                    lexer->result_symbol = WHITESPACE_NEWLINE;
                    lexer->advance(lexer, false);
                    lexer_was_advanced = true;
                } else {
                    lexer->result_symbol = WHITESPACE_HORIZONTAL;
                }
                return true;
            } else { // next char is not a whitespace char
                if (lexer_was_advanced) {
                    lexer->result_symbol = WHITESPACE_HORIZONTAL;
                    return true;
                } else {
                    return false;
                }
            }
        }
        // reached end of file...

        if (!lexer_was_advanced) {
            return false;
        }

        if (start_char_was_newline) {
            if (lexer->get_column(lexer) == 0) {
                lexer->result_symbol = WHITESPACE_NEWLINE;
            } else {
                lexer->result_symbol = WHITESPACE_BLANK_LINE;
            }
        } else {
            lexer->result_symbol = WHITESPACE_HORIZONTAL;
        }
        return true;
    }

    // whitespace symbols not allowed at current position in grammar rules
    return false;
}