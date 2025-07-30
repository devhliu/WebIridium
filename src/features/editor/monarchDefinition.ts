import * as monaco from "monaco-editor";

export const antimonyMonarchDefinition: monaco.languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      [/\/\/.*/, "comment"],
      [/"[^"]*"/, "string"], // Rule for anything surrounded by double quotation marks (")
      [/=>|->/, "transform"],
      [/```/, "comment", "@model_note"],
      [/=|:=/, "assign"],
      ["\\-|\\+|\\*|\\/|\\^|\\;", "operator"],
      ["\\b(at|in|import|has)\\b", "keywords"],
      ["\\$[A-Za-z][A-Za-z0-9_]*\\b", "boundarySpecies"],
      [
        /(?:creator\d+|modified|created|identity|isVersionOf|isDerivedFrom|isEncodedBy|isHomologTo|isPropertyOf|isPartOf|isDescribedBy|is|model_source|biological_entity_is|hasPart|parthood|part|hypernym|biological_system|hasVersion|version|homolog|description|publication|encoder|encodes|encodement|occursIn|container|hasProperty|propertyBearer|property|hasTaxon|taxon|sboTerm|model_entity_is|origin|hasInstance|instance|notes)/,
        "annotation",
      ],
      [/\b[a-zA-Z][a-zA-Z0-9_]*:/, "react-remov"], // reaction names
      [
        /@?[a-zA-Z][\w$]*/,
        {
          cases: {
            const: "const",
            unit: "unit",
            var: "var",
            species: "species",
            function: "function",
            model: "model",
            module: "model",
            end: "end",
            compartment: "compartment",
          },
        },
      ],
      [
        /\b(?:\d+(\.\d*)?|\.\d+|0[xX][0-9a-fA-F]+|0o[0-7]+|0b[01]+|\d+[eE][-+]?\d+|\d+[eE][-+]?\d+f|[-+]?\d+f)\b/,
        "number",
      ], // Combined regex for various number formats
    ],
    whitespace: [[/[ \t\r\n]+/, "white"]],
    model_note: [
      [/```/, "comment", "@pop"],
      [/./, "comment"],
    ],
  },
};
