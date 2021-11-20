// This compiles with
// cargo build --target wasm32-unknown-unknown
// wasm found in target/wasm32-unknown-unknown/debug/wasmtest.wasm
// OR
// rustc --target wasm32-unknown-unknown -O --crate-type=cdylib src/lib.rs -o lib.wasm
// wasm found in lib.wasm

#[no_mangle]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[no_mangle]
pub fn greet() -> *mut u8 {
    let ptr = String::from("Hello world!").as_mut_ptr();
    std::mem::forget(ptr);
    ptr
}

// Make sure this struct follows
// the C representation, where each
// field is stored contiguously in memory but
// aligned by the bit-width
#[repr(C)]
pub struct MyValue {
    ptr: *mut u8,
    len: usize,
}

impl MyValue {
    pub fn new(mut_ptr: *mut u8, length: usize) -> MyValue {
        MyValue {
            ptr: mut_ptr,
            len: length,
        }
    }
}

#[no_mangle]
pub fn get_stack_str() -> *mut MyValue {
    let mut str = String::from("Hello world!");
    let ptr = str.as_mut_ptr();
    std::mem::forget(ptr);
    let mut myval = MyValue::new(ptr, str.len());
    // https://doc.rust-lang.org/std/primitive.pointer.html#3-create-it-using-ptraddr_of
    let myval_ptr = std::ptr::addr_of_mut!(myval);
    std::mem::forget(myval_ptr);
    myval_ptr
}

// Doesn't work. Not sure why
// #[no_mangle]
// pub fn get_heap_str() -> *mut MyValue {
//     let mut str = String::from("Hello world!");
//     let ptr = str.as_mut_ptr();
//     std::mem::forget(ptr);
//     let myval = Box::new(MyValue::new(ptr, str.len()));
//     // https://doc.rust-lang.org/std/primitive.pointer.html#3-create-it-using-ptraddr_of
//     let myval_ptr = Box::into_raw(myval);
//     std::mem::forget(myval_ptr);
//     myval_ptr
// }

// #[cfg(test)]
// mod tests {
//     #[test]
//     fn it_works() {
//         assert_eq!("Hello world!", super::greet());
//     }
// }
