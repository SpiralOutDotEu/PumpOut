# Use an official Node.js image as the base image
FROM node:20.18

# Install essentials
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
    pkg-config build-essential libudev-dev libssl-dev git && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Set up environment variables for Rust and Bun
ENV PATH="/root/.cargo/bin:/root/.bun/bin:$PATH"

# Install Rust version <1.80
RUN rustup install 1.79 && rustup default 1.79-x86_64-unknown-linux-gnu

# Install Foundry
RUN curl -L https://foundry.paradigm.xyz | bash
# Add Foundry to the PATH
ENV PATH="/root/.foundry/bin:$PATH"
# Run foundryup
RUN foundryup

# Install Solana
RUN sh -c "$(curl -sSfL https://release.solana.com/v1.18.18/install)"

# Install avm
RUN cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install Anchor v0.29.0 and use it
RUN avm install 0.29.0 

# Install NTT
RUN curl -fsSL https://raw.githubusercontent.com/wormhole-foundation/example-native-token-transfers/main/cli/install.sh | bash

# Set the default shell to bash
SHELL ["/bin/bash", "-c"]

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*
