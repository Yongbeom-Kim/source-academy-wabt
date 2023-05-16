/**
 * Test cases for control instructions.
 * Instructions are:
 *  instr ::= . . .
 *  | nop
 *  | unreachable
 *  | block blocktype instr * end
 *  | loop blocktype instr * end
 *  | if blocktype instr * else instr * end
 *  | br labelidx
 *  | br_if labelidx
 *  | br_table vec(labelidx ) labelidx
 *  | return
 *  | call funcidx
 *  | call_indirect tableidx typeidx
 */

const nop_operation = '(module (func nop) )';
const unreachable_operation = '(module (func unreachable) )';
const block_statment = `
(module
    (func
        (block $my_block
            nop
        )
    )    
)
`;

const empty_explicit_block = `
(module
    (func 
      (block (param) (result)
          
      )
    )
  )
`;

const block_one_param = `
(module
    (func 
      i32.const 0
      (block (param i32) (result)
          
      )
    )
  )
`;

// Note: same type as function
const block_one_result = `
(module
    (func (result i32)
      (block (param) (result i32)
          i32.const 0    	
      )
    )
  )
`;

export const positiveControlTestCases = [
  nop_operation,
  unreachable_operation,
  block_statment,
  empty_explicit_block,
  //   block_one_param,
  //   block_one_result,
];
