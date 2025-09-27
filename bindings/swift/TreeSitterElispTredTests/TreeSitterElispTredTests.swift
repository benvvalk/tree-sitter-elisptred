import XCTest
import SwiftTreeSitter
import TreeSitterElisptred

final class TreeSitterElisptredTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_elisptred())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading ElispTred grammar")
    }
}
