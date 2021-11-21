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
    let mut str = String::from("Hello world!");
    let ptr = str.as_mut_ptr();
    std::mem::forget(str);
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
    let mut str: String = String::from("Hello world!");
    let ptr: *mut u8 = str.as_mut_ptr();
    let mut myval: MyValue = MyValue::new(ptr, str.len());
    // prevent str's destructor from running
    std::mem::forget(str);
    // https://doc.rust-lang.org/std/primitive.pointer.html#3-create-it-using-ptraddr_of
    let myval_ptr: *mut MyValue = std::ptr::addr_of_mut!(myval);
    myval_ptr
}

#[no_mangle]
pub fn get_heap_str() -> *mut MyValue {
    let mut str: String = String::from("Yo!");
    let ptr: *mut u8 = str.as_mut_ptr();
    let myval: Box<MyValue> = Box::new(MyValue::new(ptr, str.len()));
    // prevent str's destructor from running
    std::mem::forget(str);
    // https://doc.rust-lang.org/std/primitive.pointer.html#3-create-it-using-ptraddr_of
    let myval_ptr: *mut MyValue = Box::into_raw(myval);
    myval_ptr
}

// More safe and Rusty implementation of the
// above
#[repr(C)]
pub struct MyRustyValue<'a> {
    str_bytes: &'a mut [u8],
    len: usize,
}

impl MyRustyValue<'static> {
    pub fn new(mut_ptr: &'static mut [u8], length: usize) -> MyRustyValue<'static> {
        MyRustyValue {
            str_bytes: mut_ptr,
            len: length,
        }
    }
}

#[no_mangle]
pub fn rusty_get_heap_str() -> Box<MyRustyValue<'static>> {
    let str: String = String::from("Yo! But Rusty...");

    let str_vec: Vec<u8> = str.into_bytes();

    // converts Vec to mutable slice, leaking data, so the
    // lifetime is 'static
    //
    // leak() says there's no way to recover its data. We'll try
    // to use unsafely_dealloc() below anyway
    let str_data: &'static mut [u8] = str_vec.leak();
    let str_data_len = str_data.len();

    Box::new(MyRustyValue::new(str_data, str_data_len))
}

#[no_mangle]
pub unsafe fn unsafely_dealloc(ptr: *mut u8, size: usize) {
    let data = Vec::from_raw_parts(ptr, size, size);
    std::mem::drop(data);
}
