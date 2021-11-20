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
const memory = new WebAssembly.Memory({ initial: 20 })
const imports = {
  env: {
    memory: memory,
  },
}
WebAssembly.instantiate(wasmbuf, imports).then((mod) => {
  add = mod.instance.exports.add
  console.log(add(1, 2))

  greet = mod.instance.exports.greet
  msgPointer = greet()
  strBytes = new Uint8Array(memory.buffer, msgPointer, 20)
  console.log(new TextDecoder().decode(strBytes))

  get_stack_str = mod.instance.exports.get_stack_str
  myValuePtr = get_stack_str()
  ptrBytes = new Uint8Array(memory.buffer, myValuePtr, 8)
  strAddr = getUint32LE(ptrBytes, 0)
  strLen = getUint32LE(ptrBytes, 4)
  strBytes = new Uint8Array(memory.buffer, strAddr, strLen)
  console.log(strBytes)
  console.log(new TextDecoder().decode(strBytes))

  // Doesn't work. Not sure why
  // get_heap_str = mod.instance.exports.get_heap_str
  // myValuePtr = get_heap_str()
  // ptrBytes = new Uint8Array(memory.buffer, myValuePtr, 8)
  // strAddr = getUint32LE(ptrBytes, 0)
  // strLen = getUint32LE(ptrBytes, 4)
  // strBytes = new Uint8Array(memory.buffer, strAddr, strLen)
  // console.log(strBytes)
  // console.log(new TextDecoder().decode(strBytes))
})
