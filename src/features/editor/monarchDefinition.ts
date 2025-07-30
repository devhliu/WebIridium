import * as monaco from "monaco-editor";

export const antimonyMonarchDefinition: monaco.languages.IMonarchLanguage = {
  // uncomment this when editing the syntax highlighting to see what isn't getting
  // highlighted
  // defaultToken: "invalid",

  annotationKeywords: [
    // decode model qualifiers
    "is",
    "identity",
    "model_entity_is",
    "model_source",
    "isDescribedBy",
    "description",
    "publication",
    "isDerivedFrom",
    "origin",
    "isInstanceOf",
    "class",
    "hasInstance",
    "instance",
    // encode model qualifiers
    "model_source",
    "publication",
    "origin",
    "class",
    "instance",

    // decode biol qualifiers
    "is",
    "identity",
    "biological_entity_is",
    "hasPart",
    "part",
    "isPartOf",
    "parthood",
    "isVersionOf",
    "hypernym",
    "biological_system",
    "hasVersion",
    "version",
    "isHomologTo",
    "homolog",
    "isDescribedBy",
    "description",
    "isEncodedBy",
    "encoder",
    "encodes",
    "encodement",
    "occursIn",
    "container",
    "hasProperty",
    "property",
    "isPropertyOf",
    "propertyBearer",
    "hasTaxon",
    "taxon",
    // encode biol qualifiers
    "identity",
    "part",
    "parthood",
    "biological_system",
    "version",
    "homolog",
    "description",
    "encoder",
    "encodement",
    "container",
    "property",
    "propertyBearer",
    "taxon",

    // other
    "notes",
    "created",
    "modified",
  ],

  tokenizer: {
    root: [
      // special case for Preset: comments
      [/(\/\/)(\s*Preset:\s*)(.*)$/, ["comment", "comment.preset", "comment"]],
      [/\/\/.*$/, "comment"],
      [/#.*$/, "comment"],
      [/\/\*/, "comment", "@blockComment"],
      [/```/, "comment", "@modelNote"],

      [/"/, "string", "@string"],

      [/=>|->/, "transform"],
      [/=|:=/, "assign"],
      ["\\-|\\+|\\*|\\/|\\^|\\;", "operator"],
      ["\\b(at|in|import|has)\\b", "keywords"],
      ["\\$[A-Za-z][A-Za-z0-9_]*\\b", "boundarySpecies"],
      [/\b[a-zA-Z][a-zA-Z0-9_]*:/, "react-remov"], // reaction names
      [/creator\d*/, "annotation"],
      [
        /@?[a-zA-Z_][\w$]*/,
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
            "@annotationKeywords": "annotation",
          },
        },
      ],
      [
        /\b(?:\d+(\.\d*)?|\.\d+|0[xX][0-9a-fA-F]+|0o[0-7]+|0b[01]+|\d+[eE][-+]?\d+|\d+[eE][-+]?\d+f|[-+]?\d+f)\b/,
        "number",
      ], // Combined regex for various number formats
    ],

    blockComment: [
      [/\*\//, "comment", "@pop"],
      [/./, "comment"],
    ],

    string: [
      [/"/, "string", "@pop"],
      [/./, "string"],
    ],

    whitespace: [[/[ \t\r\n]+/, "white"]],
    modelNote: [
      [/```/, "comment", "@pop"],
      [/./, "comment"],
    ],
  },
};
