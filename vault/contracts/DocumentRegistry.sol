// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/// @title DocumentRegistry
/// @notice Anchors document hashes, issuers, signatures and an optional merkle root for batch anchoring.
contract DocumentRegistry is Ownable {
    using ECDSA for bytes32;

    struct Document {
        address owner;
        address issuer;
        uint256 timestamp;
        bool flagged;
        bytes signature; // issuer signature over the doc hash
        bytes32 merkleRoot; // optional
    }

    mapping(bytes32 => Document) private _docs;

    event DocumentRegistered(bytes32 indexed docHash, address owner, address issuer, uint256 timestamp);
    event DocumentFlagged(bytes32 indexed docHash);

    /// @notice Register a document anchor. Only issuer or caller equal to owner may register.
    /// @param docHash keccak256 hash of the document
    /// @param issuer address of the issuer who signed the doc
    /// @param signature signature bytes from issuer (over docHash)
    /// @param merkleRoot optional merkle root for batched anchoring
    function registerDocument(bytes32 docHash, address issuer, bytes calldata signature, bytes32 merkleRoot) external {
        require(docHash != bytes32(0), "zero hash");
        Document storage d = _docs[docHash];
        // allow re-registration only by same issuer/owner
        if (d.timestamp != 0) {
            require(msg.sender == d.owner || msg.sender == d.issuer, "not authorized to re-register");
        }

        d.owner = msg.sender;
        d.issuer = issuer;
        d.timestamp = block.timestamp;
        d.signature = signature;
        d.merkleRoot = merkleRoot;

        emit DocumentRegistered(docHash, d.owner, issuer, d.timestamp);
    }

    /// @notice Retrieve a registered document
    function getDocument(bytes32 docHash) external view returns (Document memory) {
        return _docs[docHash];
    }

    /// @notice Flag a document as suspicious (only owner can flag for this simple MVP)
    function flagDocument(bytes32 docHash) external onlyOwner {
        Document storage d = _docs[docHash];
        require(d.timestamp != 0, "not found");
        d.flagged = true;
        emit DocumentFlagged(docHash);
    }
}
