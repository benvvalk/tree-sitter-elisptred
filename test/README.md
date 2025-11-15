# Tree-sitter Grammar Tests

This directory contains automated tests for the tree-sitter-elisptred grammar.

## Running Tests

To run all tests:

```bash
tree-sitter test
```

To run tests matching a specific name pattern:

```bash
tree-sitter test -i 'string'
```

To run a specific test by name:

```bash
tree-sitter test -i 'Empty string'
```

## Test Structure

Tests are organized in the `corpus/` directory. Each `.txt` file contains multiple test cases.

### Test Format

Each test follows this structure:

```
==================
Test name
==================

input code here

---

(expected_parse_tree
  (as_s_expression))
```

### Important Notes

- Only **named** nodes appear in the expected parse tree (not literal strings like `"`, `;`, etc.)
- Empty `string_line` nodes still appear in the tree even though they contain no content
- The separator must be at least three dashes (`---`)

## Adding New Tests

1. Create or edit a file in `test/corpus/`
2. Add tests using the format above
3. Run `tree-sitter generate --abi 14 && tree-sitter test` to verify
4. Commit both the test file and any grammar changes

## CI Integration

These tests can be integrated into CI/CD pipelines:

```bash
tree-sitter generate && tree-sitter test
```

This ensures grammar changes don't break existing functionality.
