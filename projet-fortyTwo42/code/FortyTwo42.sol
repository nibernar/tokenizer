// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FortyTwo42 is ERC20, Ownable, Pausable, ReentrancyGuard {
    constructor() ERC20("FortyTwo42", "F42") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**decimals());
    }
}