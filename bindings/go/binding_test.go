package tree_sitter_elisptred_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_elisptred "github.com/tree-sitter/tree-sitter-elisptred/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_elisptred.Language())
	if language == nil {
		t.Errorf("Error loading ElispTred grammar")
	}
}
