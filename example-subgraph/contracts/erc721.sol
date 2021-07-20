pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/drafts/Counter.sol";

contract GameItem is ERC721Full {
    using Counter for Counter.Counter;
    Counter.Counter private _tokenIds;

    constructor() ERC721Full("GameItem", "ITM") public {
    }

    function awardItem(address player, string memory tokenURI) public returns (uint256) {
        _tokenIds.next();

        uint256 newItemId = _tokenIds.current;
        _mint(player, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}