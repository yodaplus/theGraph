#!/bin/bash

rustup default stable
cargo build --release
cp ./target/release/graph-node ..
echo "Done."
echo "find the executable in ~/"

