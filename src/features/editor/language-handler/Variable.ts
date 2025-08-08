import { SrcRange, isSubtTypeOf, varTypes } from "./Types"

export class Variable {
    /**
     * id: the id of the variable, ie A = 1 has id A
     * type: the type of the variable, ie species A has type species
     * isConst: is this variable a constant?
     * compartment: is this variable in a compartment? if so which one.
     * initialzied: has this variable been initalized? ie A = 1 initializes value to A
     * idSrcRange: the editor location of the id of this variable
     * initSrcRange: the editor location where this variable is initialized.
     */
    // public id: string;
    public type: varTypes;
    public isConst: boolean;
    public compartment: string | undefined;
    // // do we even need an initialized field if we have initSrcRange?
    // public initialized: boolean;

    // This is the range of JUST the id of a variable
    public idSrcRange: SrcRange;
    // This is typically the range of the whole assignment statement, so eg: "a = 1" would be the range
    // NOTE: this is not the case for reactions as a choice.
    public initSrcRange: SrcRange | undefined;
    public substanceOnly: boolean;
    public unit: string | undefined;
    public value: string | undefined; // for numerical values
    public displayName: string | undefined;
    public annotations: string[];
    public annotationKeywordMap: Map<string, string>;
    public annotationLineNum: Map<string, SrcRange>;
    public refLocations: Map<string, SrcRange>;

    constructor(type: varTypes,
                isConst: boolean, 
                compartment: string | undefined, 
                idSrcRange: SrcRange,
                initSrcRange: SrcRange | undefined,
                substanceOnly: boolean) {
        // this.id = id;
        this.type = type;
        this.isConst = isConst;
        this.compartment = compartment;
        this.idSrcRange = idSrcRange;
        this.initSrcRange = initSrcRange;
        this.substanceOnly = substanceOnly;
        this.unit = undefined;
        this.value = undefined;
        this.displayName = undefined;
        this.annotations = [];
        this.annotationKeywordMap = new Map();
        this.annotationLineNum = new Map();
        this.refLocations = new Map();
        this.refLocations.set(idSrcRange.toString(), idSrcRange);
    }

    /**
     * returns true when the variable can be set to 
     * newType, false otherwise. Only checks if the type
     * can be set, does not actually set the type.
     * 
     * @param newType 
     * @returns true or false
     */
    public canSetType(newType: varTypes): boolean {
        return isSubtTypeOf(newType, this.type);
    }
}

// defines predefined constants in the Antimony grammar

export const predefinedConstants: Set<string> = new Set([
    "true"
    , "false"
    , "True"
    , "False"
    , "TRUE"
    , "FALSE"
    , "pi"
    , "exponentiale"
    , "avogadro"
    , "time"
    , "inf"
    , "INF"
    , "infinity"
    , "NaN"
    , "NAN"
    , "nan"
    , "notanumber"
])
  
export {}