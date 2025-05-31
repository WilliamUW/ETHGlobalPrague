// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Useful for debugging. Remove when deploying to a live network.
import "forge-std/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract YourContract {
    // State Variables
    address public immutable owner;
    string public greeting = "Building Unstoppable Apps!!!";
    bool public premium = false;
    uint256 public totalCounter = 0;
    mapping(address => uint256) public userGreetingCounter;

    // Events: a way to emit log statements from smart contract that can be listened to by external parties
    event GreetingChange(address indexed greetingSetter, string newGreeting, bool premium, uint256 value);

    // --- Platform Enum ---
    enum Platform { Telegram, Twitter, LinkedIn }

    // --- Username Mapping ---
    // Maps (address, platform) => username
    mapping(address => mapping(Platform => string)) public platformUsernames;
    event UsernameUpdated(address indexed user, Platform indexed platform, string username);

    // --- Review System ---
    struct Review {
        address reviewer;
        uint8 rating; // 1-5
        string description;
        uint256 timestamp;
    }
    // Maps (platform, username) => array of reviews
    mapping(Platform => mapping(string => Review[])) private reviews;
    event ReviewSubmitted(
        Platform indexed platform,
        string indexed username,
        address indexed reviewer,
        uint8 rating,
        string description
    );

    // --- ERC20 TBT Token Implementation ---
    string public constant name = "Trust Buddy Token";
    string public constant symbol = "TBT";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // Constructor: Called once on contract deployment
    // Check packages/foundry/deploy/Deploy.s.sol
    constructor(address _owner) {
        owner = _owner;
    }

    // Modifier: used to define a set of rules that must be met before or after a function is executed
    // Check the withdraw() function
    modifier isOwner() {
        // msg.sender: predefined variable that represents address of the account that called the current function
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    /**
     * Function that allows anyone to change the state variable "greeting" of the contract and increase the counters
     *
     * @param _newGreeting (string memory) - new greeting to save on the contract
     */
    function setGreeting(string memory _newGreeting) public payable {
        // Print data to the anvil chain console. Remove when deploying to a live network.

        console.logString("Setting new greeting");
        console.logString(_newGreeting);

        greeting = _newGreeting;
        totalCounter += 1;
        userGreetingCounter[msg.sender] += 1;

        // msg.value: built-in global variable that represents the amount of ether sent with the transaction
        if (msg.value > 0) {
            premium = true;
        } else {
            premium = false;
        }

        // emit: keyword used to trigger an event
        emit GreetingChange(msg.sender, _newGreeting, msg.value > 0, msg.value);
    }

    /**
     * Function that allows the owner to withdraw all the Ether in the contract
     * The function can only be called by the owner of the contract as defined by the isOwner modifier
     */
    function withdraw() public isOwner {
        (bool success,) = owner.call{ value: address(this).balance }("");
        require(success, "Failed to send Ether");
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable { }

    // --- Username Functions ---
    function submitUsername(Platform _platform, string calldata _username) external {
        require(bytes(_username).length > 0, "Username cannot be empty");
        platformUsernames[msg.sender][_platform] = _username;
        emit UsernameUpdated(msg.sender, _platform, _username);
    }

    // --- Review Functions ---
    function submitReview(Platform _platform, string calldata _username, uint8 _rating, string calldata _description) external {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(_rating >= 1 && _rating <= 5, "Rating must be 1-5");

        Review memory newReview = Review({
            reviewer: msg.sender,
            rating: _rating,
            description: _description,
            timestamp: block.timestamp
        });
        reviews[_platform][_username].push(newReview);
        emit ReviewSubmitted(_platform, _username, msg.sender, _rating, _description);

        // Mint 1 TBT to reviewer
        _mint(msg.sender, 1 * 10 ** uint256(decimals));
    }

    function getReviewCount(Platform _platform, string calldata _username) external view returns (uint256) {
        return reviews[_platform][_username].length;
    }

    function getReview(Platform _platform, string calldata _username, uint256 index) external view returns (
        address reviewer,
        uint8 rating,
        string memory description,
        uint256 timestamp
    ) {
        require(index < reviews[_platform][_username].length, "Review index out of bounds");
        Review storage r = reviews[_platform][_username][index];
        return (r.reviewer, r.rating, r.description, r.timestamp);
    }

    function getAllReviews(Platform _platform, string calldata _username) external view returns (Review[] memory) {
        return reviews[_platform][_username];
    }

    // --- ERC20 Functions ---
    function transfer(address _to, uint256 _value) external returns (bool) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        _transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) external returns (bool) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) external returns (bool) {
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Allowance exceeded");
        allowance[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);
        return true;
    }

    // --- Internal ERC20 Helpers ---
    function _transfer(address _from, address _to, uint256 _value) internal {
        require(_to != address(0), "Transfer to zero address");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
    }

    function _mint(address _to, uint256 _value) internal {
        require(_to != address(0), "Mint to zero address");
        totalSupply += _value;
        balanceOf[_to] += _value;
        emit Transfer(address(0), _to, _value);
    }
}
