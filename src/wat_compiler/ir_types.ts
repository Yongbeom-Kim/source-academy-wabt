/* eslint-disable @typescript-eslint/no-use-before-define */
import { type ValueType } from '../common/type';
import { Token, TokenType } from '../common/token';
import { ExportType } from '../common/export_types';
import { assert } from '../common/assert';
import { isEqual } from 'lodash';
import { getSingleToken } from './lexer';

/**
 * Interface indicating that the particular intermediate representation
 * may contain s-expressions, and can therefore be 'unfolded'.
 */
export interface Unfoldable {
  unfold(): PureUnfoldedTokenExpression;
}

export namespace Unfoldable {
  export function instanceOf(obj: object): obj is Unfoldable {
    return 'unfold' in obj;
  }
}

/**
 * An interface for intermediate expressions that can have a name/identifier to be referenced by.
 * Mainly to be used for global types that can be referenced by name.
 */
export interface HasIdentifier {
  getID(): string | null;
}

/**
 * Interface indicating that this particular intermediate representation may store variable declarations
 * which have to b
 */
export interface MayHaveVariables {}

export abstract class IntermediateRepresentation {}

type GlobalType = FunctionSignature; // TODO add more
type GlobalExpression = HasIdentifier;

export class ModuleExpression extends IntermediateRepresentation {
  /*
    Sections in modules:
      0  Custom (unused)
      1  Type (Function Signatures)
      2  Import
      3  Function (Function )
      4  Table
      5  Memory
      6  Global
      7  Export
      8  Start
      9  Element
      10 Code
      11 Data
      12 DataCount
  */

  /**
   * Type Section. This stores global types, only function signature for now.
   * Only UNIQUE types stored here.
   */
  globalTypes: GlobalType[] = [];

  /**
   * For the function section.
   */
  functions: FunctionExpression[] = [];

  /**
   * Global variables that can be exported
   */
  globals: GlobalExpression[] = [];

  /**
   * Declarations for export section
   */
  exportExpressions: ExportExpression[] = []; // TODO add support for multiple export expressions

  constructor(...childNodes: (FunctionExpression | ExportExpression)[]) {
    super();
    for (const child of childNodes) {
      if (child instanceof FunctionExpression) {
        this.addFunctionExpression(child);
      } else if (child instanceof ExportExpression) {
        this.addExportExpression(child);
      }
    }
  }

  private addFunctionExpression(functionExpression: FunctionExpression) {
    this.functions.push(functionExpression);
    this.addGlobalType(functionExpression.functionSignature);
    this.globals.push(functionExpression);

    // Generate an export expression if it has an inline export.
    if (functionExpression.hasInlineExport) {
      this.addExportExpression(
        new ExportExpression(
          functionExpression.inlineExportName!,
          ExportType.Func,
          this.functions.length - 1,
        ),
      );
    }
  }

  private addExportExpression(exportExpression: ExportExpression) {
    this.exportExpressions.push(exportExpression);
  }

  /**
   * Add a type to the list of global types.
   * Only addes to the list of types if it does not already exist
   * @param type type to add to global type.
   */
  private addGlobalType(type: GlobalType) {
    for (const existingType of this.globalTypes) {
      if (isEqual(existingType, type)) {
        return;
      }
    }
    this.globalTypes.push(type);
  }

  getGlobalTypes(): GlobalType[] {
    return this.globalTypes;
  }

  /**
   * Query and resolve the index of a given global type.
   * Global type must exist within the module.
   * TODO: This takes O(n) per query, ideally should reduce to O(1)
   * @param type type to query
   * @returns index of type in module
   */
  resolveGlobalTypeIndex(type: GlobalType) {
    for (const [i, existing_type] of this.globalTypes.entries()) {
      if (isEqual(existing_type, type)) {
        return i;
      }
    }

    assert(
      false,
      `Global type not found! This is an error that should be raised to the developer.
      Please help raise an issue on GitHub.`,
    );
    return -1; // This will never run, assert throws error
  }

  /**
   * Query and resolve the index of a given global expression.
   * Global expression must exist within the module.
   * Comparison is made by name.
   * TODO: This takes O(n) per query, ideally should reduce to O(1)
   * @param type type to query
   * @returns index of type in module
   */
  resolveGlobalExpressionIndex(name: string) {
    for (const [i, existing_type] of this.globals.entries()) {
      if (existing_type.getID() === name) {
        return i;
      }
    }

    assert(false, 'Global not found!'); // TODO better error message
    return -1; // This will never run, assert throws error
  }

  getFunctionSignatures(): FunctionSignature[] {
    return this.functions.map((func) => func.functionSignature);
  }

  getFunctionBodies(): FunctionBody[] {
    return this.functions.map((func) => func.functionBody);
  }
}

export class ExportExpression extends IntermediateRepresentation {
  exportName: string;
  exportType: ExportType;
  exportReferenceIndex: number | null = null;
  exportReferenceName: string | null = null;

  // Constructor for inline function exports
  constructor(
    exportName: string,
    exportType: ExportType,
    exportReference: number
  );
  // TODO need to refine this construtor.
  constructor(exportName: Token, exportType: Token, exportReference: Token);
  constructor(
    exportName: string | Token,
    exportType: ExportType | Token,
    exportReference: number | Token,
  ) {
    super();
    if (typeof exportName === 'string') {
      this.exportName = exportName;
    } else {
      this.exportName = this.getExportName(exportName);
    }

    if (exportType instanceof Token) {
      this.exportType = this.getExportType(exportType);
    } else {
      this.exportType = exportType;
    }

    if (typeof exportReference === 'number') {
      this.exportReferenceIndex = exportReference;
    } else {
      [this.exportReferenceIndex, this.exportReferenceName]
        = this.getExportReference(exportReference);
    }
  }

  private getExportName(exportName: Token) {
    if (exportName.type !== TokenType.Text) {
      throw new Error(`unexpected export name: ${exportName}`); // TODO better errors
    }
    return exportName.extractText();
  }

  private getExportType(exportType: Token) {
    if (exportType.type !== TokenType.Func) {
      throw new Error(`unexpected export type: ${exportType}`); // TODO better errors
    }
    return ExportType.Func;
  }

  private getExportReference(
    exportReference: Token,
  ): [number, null] | [null, string] {
    switch (exportReference.type) {
      case TokenType.Nat:
        return [Number.parseInt(exportReference.lexeme), null];
      case TokenType.Var:
        return [null, exportReference.lexeme];
      default:
        throw new Error(
          `unexpected export ID: ${JSON.stringify(
            exportReference,
            undefined,
            2,
          )}.`,
        );
    }
  }
}
/*
FUNCTIONS
*/

/**
 * Intermediate representation of function expression.
 * Note that signature and body will be encoded in different places afterward
 */
export class FunctionExpression
  extends IntermediateRepresentation
  implements HasIdentifier {
  functionSignature: FunctionSignature;
  functionBody: FunctionBody;
  functionName: string | null;
  hasInlineExport: boolean;
  inlineExportName: string | null;

  constructor(
    paramTypes: ValueType[],
    returnTypes: ValueType[],
    paramNames: (string | null)[],
    body: TokenExpression,
    functionName: string | null = null,
    inlineExportName: string | null = null,
  ) {
    super();
    assert(
      paramTypes.length === paramNames.length,
      `Function param types and names must have same length: [${paramTypes}], [${paramNames}]`,
    );
    this.functionSignature = new FunctionSignature(paramTypes, returnTypes);
    this.functionBody = new FunctionBody(body, paramNames);
    this.functionName = functionName;
    this.inlineExportName = inlineExportName;
    this.hasInlineExport = inlineExportName !== null;
  }

  getID(): string | null {
    return this.functionName;
  }
}

/**
 * The FunctionSignature Type doubles as a class to store Function Type.
 */
export class FunctionSignature {
  paramTypes: ValueType[];
  returnTypes: ValueType[];

  constructor(paramTypes: ValueType[], returnTypes: ValueType[]) {
    this.paramTypes = paramTypes;
    this.returnTypes = returnTypes;
  }
}

/**
 * Intermediate representation of function body.
 * We are using a wrapper around TokenExpression because:
 *  (1) WABT function bodies have to be encoded differently from other blocks
 *  (2) WABT function bodies are in a different module section compared to other blocks.
 */
export class FunctionBody {
  body: TokenExpression;
  paramNames: (string | null)[];

  constructor(body: TokenExpression, paramNames: (string | null)[]) {
    this.body = body;
    this.paramNames = paramNames;
  }
}

/*
  EXPRESSION BODIES
*/

export type TokenExpression =
  | OperationTree
  | UnfoldedTokenExpression
  | EmptyTokenExpression;

/**
 * Class representing operators and operands in an s-expression.
 */
export class OperationTree
  extends IntermediateRepresentation
  implements Unfoldable {
  operator: Token;
  operands: (Token | TokenExpression)[];

  constructor(operator: Token, operands: (Token | TokenExpression)[]) {
    super();
    this.operator = operator;
    this.operands = operands;
  }

  unfold(): PureUnfoldedTokenExpression {
    const unfoldedOperands: Token[] = this.operands.flatMap((operand) => {
      if (operand instanceof Token) {
        return [operand];
      }

      return operand.unfold().tokens;
    });

    return new PureUnfoldedTokenExpression([
      ...unfoldedOperands,
      this.operator,
    ]);
  }
}

/**
 * Class representing a stack token expression. May have s-expressions inside.
 */
export class UnfoldedTokenExpression
  extends IntermediateRepresentation
  implements Unfoldable {
  tokens: (Token | OperationTree)[];

  constructor(tokens: (Token | OperationTree)[]) {
    super();
    this.tokens = tokens;
  }
  unfold(): PureUnfoldedTokenExpression {
    const unfoldedOperands: Token[] = this.tokens.flatMap((token) => {
      if (token instanceof Token) {
        return [token];
      }

      return token.unfold().tokens;
    });

    return new PureUnfoldedTokenExpression(unfoldedOperands);
  }
}

/**
 * Class to represent an empty token expression
 */
export class EmptyTokenExpression
  extends IntermediateRepresentation
  implements Unfoldable {
  unfold(): PureUnfoldedTokenExpression {
    return new PureUnfoldedTokenExpression([]);
  }
}

/**
 * Class representing a stack token expression. May NOT have s-expressions inside.
 */
export class PureUnfoldedTokenExpression extends IntermediateRepresentation {
  tokens: Token[];

  constructor(tokens: Token[]) {
    super();
    this.tokens = tokens;
  }
}
