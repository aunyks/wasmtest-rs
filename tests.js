const fs = require('fs')

function getUint32LE(array, startIndex) {
  if (array.length - startIndex < 4)
    throw new Error(`Cannot get Uint32LE: index ${startIndex} is out of bounds`)
  return (
    2 ** 24 * array[startIndex + 3] +
    2 ** 16 * array[startIndex + 2] +
    2 ** 8 * array[startIndex + 1] +
    2 ** 0 * array[startIndex + 0]
  )
}

wasmbuf = fs.readFileSync('./target/wasm32-unknown-unknown/debug/wasmtest.wasm')
WebAssembly.instantiate(wasmbuf).then((mod) => {
  // add() does the basic two integer addition
  console.log('Testing add()')
  add = mod.instance.exports.add
  console.log(add(1, 2), '\n')

  // gree() returns just a pointer to a string in memory.
  // Since we don't know its length, we just hope we get it right,
  // risking not getting the entire string or getting too many bytes in the process
  console.log('Testing greet()')
  greet = mod.instance.exports.greet
  msgPointer = greet()
  strBytes = new Uint8Array(mod.instance.exports.memory.buffer, msgPointer, 20)
  console.log(new TextDecoder().decode(strBytes), '\n')

  // get_stack_str() returns a pointer to a stack-allocated string in memory, plus its length
  // solving the length issue that greet() has
  console.log('Testing get_stack_str()')
  get_stack_str = mod.instance.exports.get_stack_str
  myValuePtr = get_stack_str()
  ptrBytes = new Uint8Array(mod.instance.exports.memory.buffer, myValuePtr, 8)
  strAddr = getUint32LE(ptrBytes, 0)
  strLen = getUint32LE(ptrBytes, 4)
  strBytes = new Uint8Array(mod.instance.exports.memory.buffer, strAddr, strLen)
  console.log(new TextDecoder().decode(strBytes), '\n')

  // get_heap_str() returns a pointer to a heap-allocated string in memory, plus its length
  // this function should be more practical than get_stack_str() has, given prominent use of Box
  // throughout Rust codebases using the stdlib
  console.log('Testing get_heap_str()')
  get_heap_str = mod.instance.exports.get_heap_str
  myValuePtr = get_heap_str()
  ptrBytes = new Uint8Array(mod.instance.exports.memory.buffer, myValuePtr, 8)
  strAddr = getUint32LE(ptrBytes, 0)
  strLen = getUint32LE(ptrBytes, 4)
  strBytes = new Uint8Array(mod.instance.exports.memory.buffer, strAddr, strLen)
  console.log(new TextDecoder().decode(strBytes), '\n')

  // rusty_get_heap_str() is just like get_heap_str(), but it's more safe and Rusty
  console.log('Testing rusty_get_heap_str()')
  rusty_get_heap_str = mod.instance.exports.rusty_get_heap_str
  myValuePtr = rusty_get_heap_str()
  ptrBytes = new Uint8Array(mod.instance.exports.memory.buffer, myValuePtr, 8)
  strAddr = getUint32LE(ptrBytes, 0)
  strLen = getUint32LE(ptrBytes, 4)
  strBytes = new Uint8Array(mod.instance.exports.memory.buffer, strAddr, strLen)
  console.log(new TextDecoder().decode(strBytes), '\n')

  // unsafely_dealloc() *should in theory* free memory based on the pointer and memory size it's given, but since it's unsafe it may cause undefined behavior, especially
  // when trying to recover and free memory claimed to be irrecoverable, such as that given by Vector's leak() function
  // Also, WASM memory can't be freed at the moment (https://stackoverflow.com/a/51544868/5699288) so...I guess it'll grow until it's OOM?
})
