// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title IssuerRegistry
/// @notice Minimal registry of trusted issuers. Admin (owner) can add/revoke issuers.
contract IssuerRegistry is Ownable {
    mapping(address => bool) private _trusted;
    mapping(address => string) private _names;

    event IssuerAdded(address indexed issuer, string name);
    event IssuerRevoked(address indexed issuer);

    /// @notice Add a trusted issuer
    function addIssuer(address issuer, string calldata name) external onlyOwner {
        require(issuer != address(0), "zero issuer");
        _trusted[issuer] = true;
        _names[issuer] = name;
        emit IssuerAdded(issuer, name);
    }

    /// @notice Revoke a trusted issuer
    function revokeIssuer(address issuer) external onlyOwner {
        require(_trusted[issuer], "not trusted");
        _trusted[issuer] = false;
        emit IssuerRevoked(issuer);
    }

    /// @notice Check if an address is a trusted issuer
    function isTrusted(address issuer) external view returns (bool) {
        return _trusted[issuer];
    }

    /// @notice Optional: get registered name for an issuer
    function nameOf(address issuer) external view returns (string memory) {
        return _names[issuer];
    }
}
