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
