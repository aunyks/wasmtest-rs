# wasmtest-rs

A playground and testbed for Rust-sourced WASM without wasm-bindgen.

## To test

0. Make sure you have Rust and Node installed, plus the `wasm32-unknown-unknown` target installed
1. Build the WASM binary

```
cargo build --target wasm32-unknown-unknown
```

2. Open the playground and run the test

```
node tests.js
```

## Special thanks

- Radu Matei (["A practical guide to WebAssembly memory"](https://radu-matei.com/blog/practical-guide-to-wasm-memory/#passing-arrays-to-rust-webassembly-modules))
- u/Nathanfenner ([Their answer to my Reddit question](https://www.reddit.com/r/rust/comments/qyd6ml/comment/hlfmu7b/?utm_source=share&utm_medium=web2x&context=3))
