/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable import/no-extraneous-dependencies */
const emptyFunctions: string = ` 
  (module
    (func)
    (func (param))
    (func (param) (result))
    (func (param) (local))
    (func (result) (local))
    (func (param) (result) (local))
  )`;

const functionParams: string = ` 
  (module
    (func (param f64 f64) (result) (local))
    (func (param f64) (param f64) (result) (local))
    (func (param $pone f64) (param $ptwo f64) (result f64) (local)
      local.get $pone
      local.get $ptwo
      f64.add
    )
  )`;

const functionResult: string = ` 
  (module
    (func (param) (result f64) (local)
      f64.const 1
    )
    (func (param) (result f64 f64) (local)
      f64.const 1
      f64.const 1
    )
    (func (param) (result f64) (result f64) (local)
      f64.const 1
      f64.const 1
    )
  )`;

const functionLocals: string = ` 
  (module
    (func (param) (result) (local f64))
    (func (param) (result) (local f64 f64))
    (func (param) (result) (local f64) (local f64))
    (func (param $pone f64) (result) (local $lone f64) (local $ltwo f64)
      local.get $pone
      local.set $lone
    )
  )
  `;

const functionNameAndExports: string = ` 
  (module
    (func (export "fn") (param) (result) (local))
    (func $fn1 (param) (result) (local))
    (func $fn3 (param) (result) (local))
    (func $fn2 (export "fn5") (param) (result) (local))
    (export "fn1" (func 1))
    (export "fn3" (func $fn3))
  )
  `;

const functionFoldedBody: string = ` 
  (module
    (func (param f64) (param f64) (result f64)
      (f64.add
        (local.get 0)
        (local.get 1)
      )
    )
    (export "add" (func 0))
  )
  `;

const functionUnfoldedBody: string = ` 
  (module
    (func (param f64) (param f64) (result f64)
      local.get 0
      local.get 1
      f64.add)
    (export "add" (func 0))
  )
  `;

const comparisonOperators: string = `
  (module
    (func (result i32)
      i32.const 0
      i32.const 0
      i32.eq
    )
  )
`;

/*

    (func (result i32)
      i64.const 0
      i64.const 0
      i64.eq
    )
    (func (result i32)
      f32.const 0
      f32.const 0
      f32.eq
    )
    (func (result i32)
      f64.const 0
      f64.const 0
      f64.eq
    )


    (func (result i32)
      i32.const 0
      i32.const 0
      i32.ne
    )
    (func (result i32)
      i64.const 0
      i64.const 0
      i64.ne
    )
    (func (result i32)
      f32.const 0
      f32.const 0
      f32.ne
    )
    (func (result i32)
      f64.const 0
      f64.const 0
      f64.ne
    )


    (func (result i32)
      i32.const 0
      i32.const 0
      i32.gt_u
    )
    (func (result i32)
      i64.const 0
      i64.const 0
      i64.gt_u
    )
    (func (result i32)
      i32.const 0
      i32.const 0
      i32.gt_s
    )
    (func (result i32)
      i64.const 0
      i64.const 0
      i64.gt_s
    )
    (func (result i32)
      f32.const 0
      f32.const 0
      f32.gt
    )
    (func (result i32)
      f64.const 0
      f64.const 0
      f64.gt
    )


    (func (result i32)
      i32.const 0
      i32.const 0
      i32.lt_u
    )
    (func (result i32)
      i64.const 0
      i64.const 0
      i64.lt_u
    )
    (func (result i32)
      i32.const 0
      i32.const 0
      i32.lt_s
    )
    (func (result i32)
      i64.const 0
      i64.const 0
      i64.lt_s
    )
    (func (result i32)
      f32.const 0
      f32.const 0
      f32.lt
    )
    (func (result i32)
      f64.const 0
      f64.const 0
      f64.lt
    )


    (func (result i32)
      i32.const 0
      i32.const 0
      i32.ge_u
    )
    (func (result i32)
      i64.const 0
      i64.const 0
      i64.ge_u
    )
    (func (result i32)
      i32.const 0
      i32.const 0
      i32.ge_s
    )
    (func (result i32)
      i64.const 0
      i64.const 0
      i64.ge_s
    )
    (func (result i32)
      f32.const 0
      f32.const 0
      f32.ge
    )
    (func (result i32)
      f64.const 0
      f64.const 0
      f64.ge
    )


    (func (result i32)
      i32.const 0
      i32.const 0
      i32.le_u
    )
    (func (result i32)
      i64.const 0
      i64.const 0
      i64.le_u
    )
    (func (result i32)
      i32.const 0
      i32.const 0
      i32.le_s
    )
    (func (result i32)
      i64.const 0
      i64.const 0
      i64.le_s
    )
    (func (result i32)
      f32.const 0
      f32.const 0
      f32.le
    )
    (func (result i32)
      f64.const 0
      f64.const 0
      f64.le
    )
     */

export const positiveFunctionTestCases = [
  // emptyFunctions,
  // functionParams,
  // functionResult,
  // functionLocals,
  // functionNameAndExports,
  // functionFoldedBody,
  // functionUnfoldedBody,
  comparisonOperators,
];
