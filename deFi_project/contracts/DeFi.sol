//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;



contract DeFi {
    // Event to emit when a memo is created
    event NewMemo(
        // indexed makes it easier to search for addresses
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    // Memo struct. We emit these fields as part of the event
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    // List of all memos received from friends.
    Memo[] memos;

    // Address of contract deployer, we want to track this because this is where we are going to withdraw our tips from the contract

    address payable owner;

    // Deploys logic only once when the contract is deployed
    constructor() {
        // This checks who deployed this contract
        owner = payable(msg.sender);
    }

    /**
     * @dev send ETH for contract owner
     * @param _name name of the sender
     * @param _message a nice message from the donor
     */

    //  memory defines where the variable should be stored and helps in passing the argument by value
    function sendETH(string memory _name, string memory _message)
        public
        payable
    {
        require(msg.value > 0, "Can't send 0 Eth");

        // Add the memo to storage, After creating this memo we have to save it in the memos array above so we use memos.push
        memos.push(Memo(msg.sender, block.timestamp, _name, _message));

        // Emit a log event when a new memo is created
        emit NewMemo(msg.sender, block.timestamp, _name, _message);
    }

    /**
     * @dev send the entire balance stored in this contract to the owner
     */

    function withDrawTips() public {
        // basically all the money is stored in address(this).balance
        require(owner.send(address(this).balance));
    }

    /**
     * @dev retrieve all the memos received on the blockchain
     */
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }
}
