// @ts-ignore

import { SrcPosition, SrcRange, varTypes } from "./Types";
import { predefinedConstants, Variable } from "./Variable";


/**
 * A Symbol table!
 */
export class SymbolTable {
    // a map from variable name to a list of positions 
    // this variable is found to be declared.
    // this takes care of variable reassignment during ST buildup
    private varMap: Map<string, Variable>;
    public endLine: number | undefined;
    public annotationSet: Set<string>;

    constructor() {
        this.varMap = new Map();
        this.annotationSet = new Set();
    }

    /**
     * 
     * @returns the variable map in the current scope
     */
    getVarMap(): Map<string, Variable> {
        return this.varMap;
    }

    /**
     * Adds variable with varName and info varInfo to the ST 
     * @param varName name of variable
     * @param varInfo a Variable that contains information about the variable
     */
    setVar(varName: string, varInfo: Variable): void {
        // if (!this.varMap.has(varName)) {
        //     this.varMap.set(varName);
        // }
        // this.varMap.get(varName)?.push(varInfo);
        this.varMap.set(varName, varInfo);
    }

    /**
     * looks up a variable
     * @param varName variable name to look up in the ST
     * @returns a Variable if the variable exists, and undefined otherwise
     */
    getVar(varName: string) {
        let varInfo = this.varMap.get(varName);
        return varInfo;
    }
}

/**
 * symbol table for the global scope in an Antimony file
 */
export class GlobalST extends SymbolTable {
    private funcMap: Map<string, ParamAndNameTable>;
    private modelMap: Map<string, ParamAndNameTable>;

    constructor() {
        super();
        this.funcMap = new Map();
        this.modelMap = new Map();

        for (const predefConst of predefinedConstants) {
            // have a dummy srcRange for predef constants
            let srcRange: SrcRange = new SrcRange(new SrcPosition(0,0), new SrcPosition(0,0));
            this.setVar(
                predefConst, 
                new Variable(varTypes.PredefConstant, true, undefined, srcRange, srcRange, false)
            )
        }
    }

    getFuncMap(): Map<string, ParamAndNameTable> {
        return this.funcMap;
    }

    getModelMap(): Map<string, ParamAndNameTable> {
        return this.modelMap;
    }

    /**
     * inserts a function into the global ST, creating a corresponding function ST for it
     * @param funcName 
     * @param srcRange the location of the function ID within the web editor
     */
    setFunction(funcName: string, srcRange: SrcRange): void {
        if (!this.funcMap.has(funcName)) {
            this.funcMap.set(funcName, new ParamAndNameTable(srcRange));
            this.setVar(funcName, new Variable(varTypes.Function, false, undefined, srcRange, srcRange, false));
        } else {
            // function already exists
            console.log("function " + funcName + " already exists")
        }
    }

    /**
     * looks up a function in the global ST
     * @param funcName 
     * @returns the symbol table for the function if it exists, undefined otherwise.
     */
    getFunctionST(funcName: string) {
        return this.funcMap.get(funcName);
    }

    /**
     * inserts a model into the global ST, creating a corresponding model ST for it
     * @param modelName 
     * @param srcRange the location of the model ID within the web editor
     */
    setModel(modelName: string, srcRange: SrcRange): void {
        if (!this.modelMap.has(modelName)) {
            this.modelMap.set(modelName, new ParamAndNameTable(srcRange));
            this.setVar(modelName, new Variable(varTypes.Model, false, undefined, srcRange, srcRange, false));
        } else {
            // model already exists
            console.log("model " + modelName + " already exists")
        }
    }

    /**
     * looks up a model in the global ST
     * @param modelName 
     * @returns the symbol table for the model if it exists, undefined otherwise
     */
    getModelST(modelName: string) {
        return this.modelMap.get(modelName);
    }

    /**
     * @description looks up a var with id that exists at srcRange
     *              checks if this variable exists in a non function context.
     * @param id 
     * @param srcRange 
     * @returns a record with field "varInfo" holding information about the variable, and 
     *          the field "annotationPosition" that gives the position where an annotation for
     *          this variable would be inserted. If the variable does not exist, undefined is returned.
     */
    hasVarAtLocation(id: string, srcRange: SrcRange) {
        let varInfo: Variable | undefined = this.getVar(id);
        if (varInfo && varInfo.refLocations.has(srcRange.toString())) {
            let line = 0
            if (this.endLine) {
                line = this.endLine + 1;
            }
            // col is 0 since in global scope
            return {varInfo: varInfo, annotationPositon: new SrcPosition(line, 0)};
        }
        
        for (const [_, modelST] of this.modelMap) {
            varInfo = modelST.getVar(id);
            if (varInfo && varInfo.refLocations.has(srcRange.toString())) {
                let line = 0;
                if (modelST.endLine) {
                    line = modelST.endLine;
                }
                // col is 2 for indent within a model, 
                // TODO: don't hardcode this!
                return {varInfo: varInfo, annotationPositon: new SrcPosition(line, 2)};
            }
        }

        return undefined;
    }
}

/**
 * a ST that is used for functions and models
 */
export class ParamAndNameTable extends SymbolTable {
    private srcRange: SrcRange;
    public params: string[];
    public paramSet: Set<string>;

    constructor(srcRange: SrcRange) {
        super();
        this.srcRange = srcRange;
        this.params = []
        this.paramSet = new Set();
    }

    /**
     * gets the id positino of the model or function represented by this ST
     * @returns a SrcRange representing the position of the id that represents this table
     */
    public getPosition(): SrcRange {
        return this.srcRange;
    }

    /**
     * adds a parameter to either a model or function
     * assumes that this parameter name is unique and has not been added before.
     * @param name 
     */
    public addParameter(name: string) {
        this.params.push(name);
        this.paramSet.add(name);
    }
}
