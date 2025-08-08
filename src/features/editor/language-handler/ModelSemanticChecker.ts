// @ts-ignore

import * as monaco from "monaco-editor";
import {
  type ANTLRErrorListener,
  ANTLRInputStream,
  CommonTokenStream,
  RecognitionException,
  Recognizer,
} from "antlr4ts";
import { AntimonyGrammarLexer } from "./antlr/AntimonyGrammarLexer";
import { AntimonyGrammarParser, RootContext } from "./antlr/AntimonyGrammarParser";
import { GlobalST, ParamAndNameTable } from "./SymbolTableClasses";
import { SymbolTableVisitor } from "./SymbolTableVisitor";
import { SemanticVisitor } from "./SemanticVisitor";
import { type ErrorUnderline, SrcPosition, SrcRange, isSubtTypeOf, varTypes } from "./Types";
import { predefinedConstants, Variable } from "./Variable";
import { editor} from "monaco-editor";

/**
 * Defines a parse error, which includes a position (line, column) as well as the error message.
 */
type parseErrors = {
  line: number;
  column: number;
  msg: string;
};

// copied from ModelParser for now
class ErrorListener implements ANTLRErrorListener<any> {
  private errors: parseErrors[] = [];

  syntaxError<T>(
      _: Recognizer<T, any>,
      __: T,
      line: number,
      charPositionInLine: number,
      msg: string,
      ___: RecognitionException | undefined
  ): void {
    this.errors.push({ line: line, column: charPositionInLine, msg: msg });
  }

  getErrors(): parseErrors[] {
    return this.errors;
  }
}

/**
 * @description Analyzes an antimony file, does error checking, and adds general hover information.
 * @param editor the monaco editor whose contents are to be semantic checked
 * @param annotHighlightOn boolean for if annotation highlighting should be on
 * @param setGeneralHoverInfo boolean that determines if variable hover info should be added.
 * @param decorations
 * @returns {GlobalST} the complete symbol table representing the program in the monaco editor.
 */
export const ModelSemanticsChecker = (
    editor: monaco.editor.IStandaloneCodeEditor,
    annotHighlightOn: boolean,
    setGeneralHoverInfo: boolean,
    highlightColor: string,
    existingDecorations: string[]
): { symbolTable: GlobalST; decorations: string[] } => {
  // Clear old decorations
  editor.deltaDecorations(existingDecorations, []);

  const antAnalyzer = new AntimonyProgramAnalyzer(editor.getValue(), highlightColor);

  // Get all errors
  let errors: ErrorUnderline[] = antAnalyzer.getErrors(true);

  // Get all unannotated variables (optional)
  let newDecorations: string[] = [];
  if (annotHighlightOn) {
    const unannotatedDecorations = antAnalyzer.getUnannotatedDecorations();
    newDecorations = editor.deltaDecorations([], unannotatedDecorations); // Add new decorations
  }

  if (setGeneralHoverInfo) {
    const hoverInfo: monaco.IDisposable = antAnalyzer.getGeneralHoverInfo();
    if (hoverInfo) {
      editor.onDidDispose(() => {
        hoverInfo.dispose();
      });
      editor.onDidChangeModelContent(() => {
        hoverInfo.dispose();
      });
    }
  }

  // Add error (and optional annotated) squiggles
  let model: monaco.editor.ITextModel | null = editor.getModel();
  if (model !== null) {
    monaco.editor.removeAllMarkers("owner");
    monaco.editor.setModelMarkers(model, "owner", errors);
  }

  return { symbolTable: antAnalyzer.getProgramST(), decorations: newDecorations }; // Return the new decorations and symbol table
};

/**
 *
 */
export class AntimonyProgramAnalyzer {
  private errorListener: ErrorListener;
  private parser: AntimonyGrammarParser;
  private tree: RootContext;
  private stVisitor: SymbolTableVisitor;
  private semanticVisitor: SemanticVisitor;
  private globalST: GlobalST;
  private hoverKeyWordColor: Map<string, string>;
  private highlightColor: string;
  private hoverProviderDisposable: monaco.IDisposable | null = null;

  constructor(antimonyCode: string, highlightColor: string) {
    // we remove carriage returns in the string since
    // these only exist in new lines on windows OS, and interfere with the
    // grammar parse.
    antimonyCode = this.removeCarriageReturn(antimonyCode);
    this.highlightColor = highlightColor;
    let inputStream = new ANTLRInputStream(antimonyCode);
    let lexer = new AntimonyGrammarLexer(inputStream);
    let tokenStream = new CommonTokenStream(lexer);
    this.parser = new AntimonyGrammarParser(tokenStream);
    this.errorListener = new ErrorListener();
    this.parser.removeErrorListeners();
    this.parser.addErrorListener(this.errorListener);

    // Parse the input, where `compilationUnit` is whatever entry point you defined
    this.tree = this.parser.root();
    this.globalST = new GlobalST();
    this.globalST.endLine = this.tree._stop?.line;
    this.stVisitor = new SymbolTableVisitor(this.globalST);
    this.stVisitor.visit(this.tree);
    this.semanticVisitor = new SemanticVisitor(this.globalST);
    this.semanticVisitor.visit(this.tree);

    this.hoverKeyWordColor = new Map();
    this.hoverKeyWordColor.set(varTypes.Species, "#FD7F20");
    this.hoverKeyWordColor.set(varTypes.Compartment, "#bc96ca");
    this.hoverKeyWordColor.set(varTypes.Const, "#dcd52b");
    this.hoverKeyWordColor.set(varTypes.Parameter, "");
    this.hoverKeyWordColor.set(varTypes.Event, "");
    this.hoverKeyWordColor.set(varTypes.Deleted, "");
    this.hoverKeyWordColor.set(varTypes.Constraint, "");
    this.hoverKeyWordColor.set(varTypes.Function, "");
    this.hoverKeyWordColor.set(varTypes.Import, "");
    this.hoverKeyWordColor.set(varTypes.Interaction, "");
    this.hoverKeyWordColor.set(varTypes.Model, "");
    this.hoverKeyWordColor.set(varTypes.ModularModel, "");
    this.hoverKeyWordColor.set(varTypes.Reaction, "");
    this.hoverKeyWordColor.set(varTypes.Variable, "#9cdcfe");
    this.hoverKeyWordColor.set(varTypes.Unknown, "");
  }

  /**
   * Retrieves an array of both semantic and parse errors caught when analyzing the program
   * @param includeParseErrors boolean determining whether to include parse errors or not
   *                           (mainly used for isolated testing of semantic error checking).
   * @returns {ErrorUnderline[]}
   */
  getErrors(includeParseErrors: boolean): ErrorUnderline[] {
    if (includeParseErrors) {
      this.stVisitor.addErrorList(this.addParseErrors(this.errorListener.getErrors()));
    }
    return this.stVisitor.getErrors().concat(this.semanticVisitor.getErrors());
  }

  /**
   * Adds variable and annotation information to hovers.
   * @returns
   */
  getGeneralHoverInfo() {
    if (this.hoverProviderDisposable) {
      this.hoverProviderDisposable.dispose();
    }

    this.hoverProviderDisposable = monaco.languages.registerHoverProvider("antimony", {
      provideHover: (model, position) => {
        if (model.isDisposed()) {
          console.error("Model is disposed. Cannot provide hover.");
          return null;
        }
        let hoverContents: monaco.IMarkdownString[] = [];
        let valueOfHover: string = "";
        let valueOfAnnotation: string = "";
        const word = model.getWordAtPosition(position);
        // Check if word exists
        if (word) {
          // set range for hover
          let hoverLine = position.lineNumber;
          let hoverColumnStart = word.startColumn;
          let hoverColumnEnd = word.endColumn;

          // check if variable with id word.word exists at the given position range.
          // if it does use the stored variable info to create a hover.
          let start: SrcPosition = new SrcPosition(position.lineNumber, word.startColumn);
          let end: SrcPosition = new SrcPosition(position.lineNumber, word.endColumn);
          let srcRange: SrcRange = new SrcRange(start, end);
          let varInfo = this.globalST.hasVarAtLocation(word.word, srcRange)?.varInfo;

          if (varInfo) {
            if (varInfo.type === varTypes.Model) {
              valueOfHover += this.getModelHover(word.word);
            } else if (varInfo.type === varTypes.Function) {
              valueOfHover += this.getFuncHover(word.word);
            } else if (predefinedConstants.has(word.word)) {
              valueOfHover += this.getPredefVarOrConstHover(word.word);
            } else {
              // we only add hover right now if 
              // it is not a predefined constant.
              
              if (varInfo.isConst) {
                valueOfHover += `<span style="color:${this.hoverKeyWordColor.get(
                    varTypes.Const
                )};">const</span> <br/> `;
              } else if (isSubtTypeOf(varInfo.type, varTypes.Variable)) {
                valueOfHover += `<span style="color:${this.hoverKeyWordColor.get(
                    varTypes.Variable
                )};">var</span> <br/> `;
              }

              if (varInfo.displayName) {
                valueOfHover += `<span style="color:#f2ab7c;">${varInfo.displayName}</span> <br/> `;
              }

              valueOfHover += `(<span style="color:${this.hoverKeyWordColor.get(varInfo.type)};">${
                  varInfo.type
              }</span>) ${word.word} <br/> `;

              if (varInfo.value) {
                valueOfHover += `Initialized Value: <span style="color:#DEF9CB;">${varInfo.value}</span> <br/> `;
              }

              if (varInfo.unit) {
                valueOfHover += `unit: <span>${varInfo.unit}</span><br/>`;
              }

              if (varInfo.compartment) {
                valueOfHover += `In <span style="color:${this.hoverKeyWordColor.get(
                    varTypes.Compartment
                )};">${varTypes.Compartment}</span>: ${varInfo.compartment} <br/> `;
              }

              varInfo.annotations.forEach((annotation) => {
                // get any additional comment on the same line as the annotation
                let comment: string = this.getAnnotationComment(annotation, varInfo, model);

                // the annotation keyword, ie "identity", "part", etc
                let keyword: string | undefined = varInfo?.annotationKeywordMap.get(annotation);
                let link: string = annotation.replace(/"/g, "");
                valueOfAnnotation += `<span>
                        <span style="color:#d33682;">${keyword} </span>
                        <a href=${annotation.replace(/"/g, "")}>${link}</a>
                        <span style="color:#76b947;">${comment}</span>
                        <span 
                          class="trash-icon" 
                          data-annotation=${annotation}>🗑️</span>
                        </span>
                    </span><br/>`;
              });
            }

            // add valueOfHover and valueOfAnnotation to hoverContents
            hoverContents.push({ supportHtml: true, value: valueOfHover });
            hoverContents.push({ supportHtml: true, value: valueOfAnnotation });

            // Add event listener to handle trash icon click once
            if (!this.isTrashIconClickListenerAdded) {
              document.addEventListener("click", (e) => {
                this.handleTrashIconClick(e, model, word.word, srcRange);
              });
              this.isTrashIconClickListenerAdded = true;
            }
          } else {
            // check if it is an annotation string.
            let line: string = model.getLineContent(position.lineNumber);
            let startCol = word.startColumn;
            let endCol = word.startColumn;
            while (startCol >= 0) {
              if (line.charAt(startCol) === '"' || line.charAt(startCol) === " ") {
                startCol++;
                break;
              }
              startCol--;
            }
            while (endCol < line.length) {
              if (
                line.charAt(endCol) === '"' ||
                line.charAt(endCol) === " " ||
                line.charAt(endCol) === "\r" ||
                line.charAt(endCol) === "\n"
              ) {
                endCol--;
                break;
              }
              endCol++;
            }
            let foundString: string = line.substring(startCol, endCol + 1);
            if (
              foundString.charAt(0) === '"' &&
              foundString.charAt(foundString.length - 1) === '"'
            ) {
              foundString = foundString.replace('"', "");
              startCol++;
              endCol--;
            }

            if (
              this.isValidUrl(foundString) ||
              this.globalST.annotationSet.has('"' + foundString + '"')
            ) {
              hoverContents.push({
                supportHtml: true,
                value: foundString,
              });
              // set new hover bounds to be that of the url
              hoverColumnStart = startCol + 1;
              hoverColumnEnd = endCol + 2;
            }
          }


          return {
            range: new monaco.Range(hoverLine, hoverColumnStart, hoverLine, hoverColumnEnd),
            contents: hoverContents,
          };
        }
      },
    });
    return this.hoverProviderDisposable;
  }

  private isTrashIconClickListenerAdded = false;

  /**
   * Handles the click event on a trash icon to delete an annotation associated with the icon.
   * Retrieves the annotation data from the target element and deletes it from the UI and data structures.
   *
   * @param event The MouseEvent object representing the click event.
   */
  private handleTrashIconClick(event: MouseEvent, model: editor.ITextModel, word: string, srcRange: SrcRange | undefined) {
    const target = event.target as HTMLElement;
    if (target) {
      let annotation = target.getAttribute("data-annotation");
      if (annotation) {
        this.deleteAnnotation(annotation, target, model, word, srcRange, event);
      }
    }
  }

  /**
   * This method handles the removal of a specified annotation from the editor. It adjusts the
   * document's text to delete the annotation and potentially modify or consolidate lines to
   * prevent format disruptions in the source code. This function also updates the internal
   * data structures to reflect the removal of the annotation, ensures that all related UI
   * elements are updated accordingly, and maintains the integrity of remaining annotations.
   *
   * The process includes recalculating line and column positions for any remaining annotations
   * to ensure accurate display and interaction within the editor.
   *
   * @param annotation The specific annotation identifier as a string, which is to be removed.
   * @param target The HTMLElement that represents the clickable trash icon, which initiated
   *               the deletion process.
   * @param model The Monaco editor's text model, which is used for reading and modifying the
   *              text within the editor.
   * @param word The word or identifier associated with the annotation being deleted, used to
   *             update or reference the relevant variable information.
   * @param srcRange An optional source range specifying the location of the word within the
   *                 editor, which may affect how the text and annotations are managed around
   *                 the deleted annotation.
   */
  private deleteAnnotation(annotation: string, target: HTMLElement, model: editor.ITextModel, word: string, srcRange: SrcRange | undefined, event: MouseEvent) {
    annotation = "\"" + annotation + "\"";
    if (model.isDisposed()) {
      console.error("Model is disposed. Cannot provide deleting.");
      return null;
    }
    event.stopPropagation();
    if (srcRange) {
      // Get annotation location to delete from content menu
      let varInfo = this.globalST.hasVarAtLocation(word, srcRange)?.varInfo;
      let annLineNum = varInfo?.annotationLineNum.get(annotation);

      if (varInfo && annLineNum) {
        // Find the remaining annotation list which excludes the deleted annotation
        const remainingAnnotations = this.getRemainingAnnotations(varInfo, annotation);

        // Calculate the accurate range to delete the specific annotation line
        const { startLine, startColumn, endLine, endColumn } = this.getAnnotationRange(annLineNum, model);
        const keyWord = varInfo.annotationKeywordMap.get(annotation);
        if (keyWord === undefined) {
          console.error('Error: keyWord is undefined.');
          return;
        }

        // Create the new text to replace the deleted text
        const resultString = this.createNewText(remainingAnnotations, keyWord, word);

        // Update varInfo mappings
        this.updateVarInfoMappings(varInfo, annotation, remainingAnnotations, startLine);

        // Update line number of each annotation in remaining annotation since there are some annotations deleted, the range
        // is changed as well
        this.adjustAnnotationLineNumbers(varInfo, remainingAnnotations, endLine);

        // Replace
        const range = new monaco.Range(startLine, startColumn, endLine, endColumn);
        const op = {
          range: range,
          text: resultString
        };

        model.pushEditOperations([], [op], () => null);
        this.deleteMultipleRanges(model, [new SrcRange(new SrcPosition(endLine, endColumn), new SrcPosition(endLine + 1, 1))])
      }

      // Remove the annotation's UI element from the DOM
      const annotationElement = target.parentElement;
      if (annotationElement) {
        annotationElement.remove();
      }

      // Update the Monaco editor model content to reflect changes
      model.setValue(model.getValue());

    }
  }
  private getRemainingAnnotations(varInfo: Variable, annotation: string): string[] {
    const annotationRange = varInfo.annotationLineNum.get(annotation);
    return varInfo.annotations.filter(ann => {
      const annKeyWord = varInfo.annotationKeywordMap.get(ann);
      const annRange = varInfo.annotationLineNum.get(ann);
      return annKeyWord === varInfo.annotationKeywordMap.get(annotation)
          && ann !== annotation
          && annRange?.start.line === annotationRange?.start.line
          && annRange?.end.line === annotationRange?.end.line;
    });
  }

  private getAnnotationRange(annLineNum: SrcRange, model: editor.ITextModel) {
    const startLine = annLineNum.start.line;
    const startColumn = 1; // Assuming the annotation starts at the beginning of the line
    const endLine = annLineNum.end.line;
    const endColumn = model.getLineMaxColumn(endLine);
    return { startLine, startColumn, endLine, endColumn };
  }

  private createNewText(remainingAnnotations: string[], keyWord: string, word: string): string {
    const varNameAndKeyWord = "  " + word + " " + keyWord + " ";
    const indent = ' '.repeat(word.length + keyWord.length + 4);
    let resultString = remainingAnnotations.join(',\n' + indent);
    resultString = remainingAnnotations.length === 0 ? "" : varNameAndKeyWord + resultString + '\n';
    return resultString;
  }

  private updateVarInfoMappings(varInfo: Variable, annotation: string, remainingAnnotations: string[], startLine: number) {
    varInfo.annotationKeywordMap.delete(annotation);
    varInfo.annotationLineNum.delete(annotation);
    varInfo.annotations = varInfo.annotations.filter((ann) => ann !== annotation);
    const bigLoc = startLine + ":" + varInfo.idSrcRange.start.column + " - " + startLine + ":" + varInfo.idSrcRange.end.column;
    if (remainingAnnotations.length === 0) {
      varInfo.refLocations.delete(bigLoc);
    }
  }

  private adjustAnnotationLineNumbers(varInfo: Variable, remainingAnnotations: string[], endLineOfDeletedAnnotation: number) {
    varInfo.annotationLineNum.forEach((value, key, map) => {
      const startLineOfCurrentAnnotation = value.start.line;
      if (varInfo?.annotations.length === undefined) {
        console.log("Length of annotation is undefined");
        // When moving one annotation in one keyword up, we need to move the end line of other annotations in that keyword up
      } else if (remainingAnnotations.includes(key)) {
        map.set(key, new SrcRange(value.start, new SrcPosition(value.end.line - 1, value.end.column)));
        // Move start line and end line of annotations of other keywords up
      } else if (startLineOfCurrentAnnotation > endLineOfDeletedAnnotation) {
        map.set(key, new SrcRange(new SrcPosition(value.start.line - 1, value.start.column),
            new SrcPosition(value.end.line - 1, value.end.column)));
        // Delete the old refLocation of keyword from map
        const oldRefLocation = startLineOfCurrentAnnotation + ":" + varInfo.idSrcRange.start.column + " - " +
            startLineOfCurrentAnnotation + ":" + varInfo.idSrcRange.end.column;
        varInfo.refLocations.delete(oldRefLocation);
        const newRefLocation = (value.start.line - 1) + ":" + varInfo.idSrcRange.start.column + " - " +
            ((value.start.line - 1)) + ":" + varInfo.idSrcRange.end.column;
        varInfo.refLocations.set(newRefLocation, new SrcRange(
            new SrcPosition(value.start.line - 1, varInfo.idSrcRange.start.column),
            new SrcPosition(value.start.line - 1, varInfo.idSrcRange.start.column)
        ));
      }
    });
  }

  private deleteMultipleRanges(model: monaco.editor.ITextModel, ranges: SrcRange[]) {
    const operations = ranges.map(range => ({
      range: new monaco.Range(range.start.line, range.start.column, range.end.line, range.end.column),
      text: '' // Empty text to delete the range
    }));

    // Push edit operations to the model
    model.pushEditOperations([], operations, () => null);
  }

  /**
   * grabs any comment on the line of a single line annotation
   * @param annotation the annotation hyperlink string
   * @param varInfo variable info for the var being annotated
   * @param model editor text model
   * @returns comment if it exists, empty string otherwise
   */
  private getAnnotationComment(
      annotation: string,
      varInfo: Variable | undefined,
      model: monaco.editor.ITextModel
  ): string {
    let lineInfo: SrcRange | undefined = varInfo?.annotationLineNum.get(annotation);
    let comment: string = "";

    if (lineInfo) {
      // get the line the annotation is on, and try to find the comment string
      let lineContent: string = model.getLineContent(lineInfo.end.line);
      // split on both "//" and ";" on the line.
      let commentStart: number = lineInfo.end.column + annotation.length - 2;
      let line: string[] = lineContent.substring(commentStart).split(/\/\/|;/);

      if (line.length > 0 && line[line.length - 1].length !== 0) {
        comment = '"' + line[line.length - 1] + '"';
      }
    }
    return comment;
  }

  private isValidUrl(urlString: string): boolean {
    let url;
    try {
      url = new URL(urlString);
    } catch (e) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  /**
   * Given the id of either a predefined Antimony constant
   * or variable, returns the associated hover string.
   * @param id 
   * @returns hover string
   */
  private getPredefVarOrConstHover(id: string) {
    let predefType: string = 'constant';
    if (id === 'time') {
      predefType = 'variable';
    } 
    return `<span> '${id}' is a predefined ${predefType} </span>`;
  }

  /**
   * Gets string format of what should appear when hovering over a model's id
   * @param modelId
   * @returns {string}
   */
  private getModelHover(modelId: string): string {
    let hover: string = `${modelId}(`;
    const modelST: ParamAndNameTable | undefined = this.globalST.getModelST(modelId);
    if (modelST) {
      for (let i = 0; i < modelST.params.length; i++) {
        const paramId: string = modelST.params[i];
        let paramVarInfo: Variable | undefined = modelST.getVar(paramId);
        if (paramVarInfo) {
          hover += `<span style="color:${this.hoverKeyWordColor.get(paramVarInfo.type)};">${
              paramVarInfo.type
          }</span>: ${paramId}`;
          if (i !== modelST.params.length - 1) {
            hover += `, `;
          }
        }
      }
    }
    hover += `) <br/> `;
    return hover;
  }

  /**
   * Gets a string of what should appear when hovering over a function's id
   * @param funcId
   * @returns {string}
   */
  private getFuncHover(funcId: string): string {
    let hover: string = `${funcId}(`;
    const funcST: ParamAndNameTable | undefined = this.globalST.getFunctionST(funcId);
    if (funcST) {
      for (let i = 0; i < funcST.params.length; i++) {
        const paramId: string = funcST.params[i];
        hover += `${paramId}`;
        if (i !== funcST.params.length - 1) {
          hover += `, `;
        }
      }
    }
    hover += `) <br/> `;
    return hover;
  }

  /**
   * Used to add annotation highlighting
   * @returns {ErrorUnderline[]} for all species, reactions, compartments variables without annotations
   */
  getUnannotatedVariables(): ErrorUnderline[] {
    const unannotated: Variable[] = [];

    // Get unannotated variables
    for (const varInfo of this.globalST.getVarMap().values()) {
      if (
          varInfo.annotations.length === 0 &&
          (varInfo.type === varTypes.Compartment ||
              varInfo.type === varTypes.Species ||
              varInfo.type === varTypes.Reaction)
      ) {
        unannotated.push(varInfo);
      }
    }

    for (const modelMap of this.globalST.getModelMap().values()) {
      for (const varInfo of modelMap.getVarMap().values()) {
        if (
            varInfo.annotations.length === 0 &&
            (varInfo.type === varTypes.Compartment ||
                varInfo.type === varTypes.Species ||
                varInfo.type === varTypes.Reaction)
        ) {
          unannotated.push(varInfo);
        }
      }
    }

    for (const funcMap of this.globalST.getFuncMap().values()) {
      for (const varInfo of funcMap.getVarMap().values()) {
        if (
            varInfo.annotations.length === 0 &&
            (varInfo.type === varTypes.Compartment ||
                varInfo.type === varTypes.Species ||
                varInfo.type === varTypes.Reaction)
        ) {
          unannotated.push(varInfo);
        }
      }
    }

    // Identify where to add unannotated squiggle
    const errors: ErrorUnderline[] = [];
    for (let i = 0; i < unannotated.length; i++) {
      const varInfo: Variable = unannotated[i];
      for (const range of varInfo.refLocations.values()) {
        errors.push({
          startLineNumber: range.start.line,
          startColumn: range.start.column,
          endLineNumber: range.end.line,
          endColumn: range.end.column,
          message: "Consider adding an annotation to this variable.",
          severity: monaco.MarkerSeverity.Error,
        });
      }
    }

    return errors;
  }

  /**
   * Retrieves decorations for unannotated variables in a Monaco editor instance.
   * Each decoration marks specific ranges where unannotated variables are referenced.
   * @returns An array of Monaco editor decorations (`monaco.editor.IModelDeltaDecoration`).
   */
  getUnannotatedDecorations(): monaco.editor.IModelDeltaDecoration[] {
    const unannotatedErrors: ErrorUnderline[] = this.getUnannotatedVariables();
    console.log(unannotatedErrors)
    const decorations: monaco.editor.IModelDeltaDecoration[] = unannotatedErrors.map(variable => {
      let colorClass = 'custom-highlight';

      // Dynamically inject CSS for the decoration
      addDynamicStyleRule(`.${colorClass} { background-color: ${this.highlightColor}; color: black; }`);

      return {
        range: new monaco.Range(
            variable.startLineNumber,
            variable.startColumn,
            variable.endLineNumber,
            variable.endColumn
        ),
        options: {
          inlineClassNameAffectsLetterSpacing: true,
          className: colorClass,
          stickiness: monaco.editor.TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges
        }
      };
    }).flat();
    return decorations;
  }

  /**
   * Gets the symbol table representing the entire analyzed file
   * @returns {GLbitfield}
   */
  getProgramST(): GlobalST {
    return this.globalST;
  }

  /**
   * takes the parse errors discovered and
   * returns each one in the same format as the other semantic errors
   * basically following the "ErrorUnderline" type
   * @param errors list of discovered parseErrors
   * @returns a list of ErrorUnderline's
   */
  private addParseErrors(errors: parseErrors[]): ErrorUnderline[] {
    let parseErrors = [];
    for (let i = 0; i < errors.length; i++) {
      const line: number = errors[i].line;
      const column: number = errors[i].column + 1;
      const msg = errors[i].msg;

      let error = {
        startLineNumber: line,
        startColumn: column,
        endLineNumber: line,
        endColumn: column + 1,
        message: msg,
        severity: monaco.MarkerSeverity.Error,
      };
      parseErrors.push(error);
    }
    return parseErrors;
  }

  /**
   * TODO: probably change the grammar later, for now we remove carriage returns
   * as the grammar is not configured to account for it (only occurs on Windows machines I think?)
   * @param input
   * @returns
   */
  private removeCarriageReturn(input: string): string {
    return input.replaceAll("\r", "");
  }
}

/**
 * Adds a dynamically created CSS rule to the document's head.
 * Creates a <style> element and appends it to the document head,
 * then inserts the given CSS rule into the style sheet.
 *
 * @param css The CSS rule to be added dynamically.
 */
export function addDynamicStyleRule(css: string): void {
  const style = document.createElement('style');
  style.type = 'text/css';
  document.head.appendChild(style);

  // Check if the style sheet exists and insert the CSS rule.
  if (style.sheet) {
    style.sheet.insertRule(css, style.sheet.cssRules.length);
  }
}

/**
 * Error checks an antimony program, and returns all of the errors in an array.
 * @param antimonyCode string that is antimony program code to be error checked
 * @param includeParseErrors errors include parse errors if true, otherwise does not include.
 *                           This is mostly for testing, as we do not need to test the parser.
 * @returns a list of errors that can be passed to monaco for display
 */
export function getErrors(antimonyCode: string, includeParseErrors: boolean): ErrorUnderline[] {
  let inputStream = new ANTLRInputStream(antimonyCode);
  let lexer = new AntimonyGrammarLexer(inputStream);
  let tokenStream = new CommonTokenStream(lexer);
  let parser = new AntimonyGrammarParser(tokenStream);

  const errorListener = new ErrorListener();
  parser.removeErrorListeners();
  parser.addErrorListener(errorListener);

  // Parse the input, where `compilationUnit` is whatever entry point you defined
  let tree = parser.root();

  // create and buildup a global symbol table from the parse tree.
  let globalSymbolTable: GlobalST = new GlobalST();
  const stVisitor: SymbolTableVisitor = new SymbolTableVisitor(globalSymbolTable);
  stVisitor.visit(tree);

  // using the populated symbol table, we now do more extensive semantic checking
  const semanticVisitor: SemanticVisitor = new SemanticVisitor(stVisitor.globalST);
  semanticVisitor.visit(tree);

  // this is mainly an option so that tests can focus on just semantic errors
  if (includeParseErrors) {
    stVisitor.addErrorList(addParseErrors(errorListener.getErrors()));
  }

  return stVisitor.getErrors().concat(semanticVisitor.getErrors());
}

/**
 * takes the parse errors discovered and
 * returns each one in the same format as the other semantic errors
 * basically following the "ErrorUnderline" type
 * @param errors list of discovered parseErrors
 * @returns a list of ErrorUnderline's
 */
function addParseErrors(errors: parseErrors[]): ErrorUnderline[] {
  let parseErrors = [];
  for (let i = 0; i < errors.length; i++) {
    const line: number = errors[i].line;
    const column: number = errors[i].column + 1;
    const msg = errors[i].msg;

    let error = {
      startLineNumber: line,
      startColumn: column,
      endLineNumber: line,
      endColumn: column + 1,
      message: msg,
      severity: monaco.MarkerSeverity.Error,
    };
    parseErrors.push(error);
  }
  return parseErrors;
}

export function removeCarriageReturn(input: string): string {
  return input.replaceAll("\r", "");
}

export default ModelSemanticsChecker;
