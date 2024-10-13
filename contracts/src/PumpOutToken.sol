// SPDX-License-Identifier: Apache 2
pragma solidity >=0.6.12 <0.9.0;

import "./PeerToken.sol";

contract PumpOutToken is PeerToken {
    constructor(string memory _name, string memory _symbol, address _minter, address _owner)
        PeerToken(_name, _symbol, _minter, _owner)
    {}
}
