// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract TipPool {
    address public owner;
    uint256 public minPayout;
    
    struct Recipient {
        address addr;
        uint256 bps; // Basis points (e.g. 5000 = 50%)
    }
    
    Recipient[] public recipientsList;

    event TipReceived(address indexed from, uint256 amount);
    event PayoutExecuted(uint256 total, address[] recipients, uint256[] amounts);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(uint256 _minPayout) {
        owner = msg.sender;
        minPayout = _minPayout;
    }

    // Receive CRO
    receive() external payable {
        emit TipReceived(msg.sender, msg.value);
    }

    // Owner configuration
    function setMinPayout(uint256 _min) external onlyOwner {
        minPayout = _min;
    }

    function setRecipients(address[] calldata _addrs, uint256[] calldata _bps) external onlyOwner {
        require(_addrs.length == _bps.length, "Length mismatch");
        delete recipientsList;
        uint256 totalBps = 0;
        for (uint i = 0; i < _addrs.length; i++) {
            recipientsList.push(Recipient(_addrs[i], _bps[i]));
            totalBps += _bps[i];
        }
        require(totalBps == 10000, "Total must be 10000 bps");
    }

    // View functions
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getRecipients() external view returns (address[] memory, uint256[] memory) {
        address[] memory addrs = new address[](recipientsList.length);
        uint256[] memory bps = new uint256[](recipientsList.length);
        for(uint i=0; i<recipientsList.length; i++) {
            addrs[i] = recipientsList[i].addr;
            bps[i] = recipientsList[i].bps;
        }
        return (addrs, bps);
    }

    // Distribute
    function distribute() external {
        uint256 balance = address(this).balance;
        require(balance >= minPayout && balance > 0, "Threshold not met or empty");
        require(recipientsList.length > 0, "No recipients");

        uint256 totalDistributed = 0;
        address[] memory payoutAddrs = new address[](recipientsList.length);
        uint256[] memory payoutAmts = new uint256[](recipientsList.length);

        // Snapshot balance to avoid re-entrancy issues affecting logic, though transfer is safe
        uint256 amountToDistribute = balance;

        for (uint i = 0; i < recipientsList.length; i++) {
            uint256 amount = (amountToDistribute * recipientsList[i].bps) / 10000;
            if (amount > 0) {
                (bool sent, ) = recipientsList[i].addr.call{value: amount}("");
                require(sent, "Transfer failed");
                totalDistributed += amount;
                payoutAddrs[i] = recipientsList[i].addr;
                payoutAmts[i] = amount;
            }
        }
        
        emit PayoutExecuted(totalDistributed, payoutAddrs, payoutAmts);
    }
}
