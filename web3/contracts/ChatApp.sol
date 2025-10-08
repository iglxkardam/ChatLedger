// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract ChatLedger {
    // message types enum
    enum MessageType { TEXT, IMAGE, VIDEO, AUDIO, ETH_TRANSFER, TOKEN_TRANSFER }

    struct user {
        string name;
        string profilePicture; 
        friend[] friendList;
    }
    
    struct friend {
        address pubkey;
        string name;
    }
    
    // enhanced message struct with multimedia and transfer support
    struct message {
        address sender;
        uint256 timestamp;
        string content; // For text messages or IPFS hash for media
        MessageType msgType;
        uint256 amount; // For transfers (ETH in wei, tokens in smallest unit)
        address tokenAddress; // For token transfers (address(0) for ETH)
        string metadata; // JSON metadata for media files
    }
    
    struct AllUserStruck {
        string name;
        address accountAddress;
    }
    
    // events ocur
    event MessageSent(address indexed sender, address indexed receiver, MessageType msgType, uint256 amount);
    event MediaMessageSent(address indexed sender, address indexed receiver, string ipfsHash, MessageType msgType);
    event EthTransferred(address indexed from, address indexed to, uint256 amount);
    event TokenTransferred(address indexed from, address indexed to, address tokenAddress, uint256 amount);
    event ProfilePictureUpdated(address indexed user, string ipfsHash);
    
    AllUserStruck[] getAllUsers;
    mapping(address => user) userList;
    mapping(bytes32 => message[]) allMessages;
    
    //sSupported token addresses (can be managed by admin/IGL)
    mapping(address => bool) public supportedTokens;
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }

    function updateProfilePicture(string calldata ipfsHash) external {
            require(checkUserExists(msg.sender), "User does not exist");
            require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
            
            userList[msg.sender].profilePicture = ipfsHash;
            
            emit ProfilePictureUpdated(msg.sender, ipfsHash);
    }

    function getProfilePicture(address userAddress) external view returns (string memory) {
        require(checkUserExists(userAddress), "User does not exist");
        return userList[userAddress].profilePicture;
    }
    
    // Admin function to add supported tokens
    function addSupportedToken(address tokenAddress) external onlyOwner {
        supportedTokens[tokenAddress] = true;
    }
    
    function removeSupportedToken(address tokenAddress) external onlyOwner {
        supportedTokens[tokenAddress] = false;
    }
    
    // CHECK USER EXIST
    function checkUserExists(address pubkey) public view returns(bool) {
        return bytes(userList[pubkey].name).length > 0;
    }
    
    // CREATE ACCOUNT
    function createAccount(string calldata name) external {
        require(checkUserExists(msg.sender) == false, "User already exists");
        require(bytes(name).length > 0, "Username cannot be empty");
        
        userList[msg.sender].name = name;
        userList[msg.sender].profilePicture = ""; 
        getAllUsers.push(AllUserStruck(name, msg.sender));
    }
    
    // GET USERNAME
    function getUsername(address pubkey) external view returns(string memory) {
        require(checkUserExists(pubkey), "User is not registered");
        return userList[pubkey].name;
    }
    
    // ADD FRIENDS
    function addFriend(address friend_key, string calldata name) external {
        require(checkUserExists(msg.sender), "Create an account first");
        require(checkUserExists(friend_key), "User is not registered!");
        require(msg.sender != friend_key, "Users cannot add themselves as friends");
        require(checkAlreadyFriends(msg.sender, friend_key) == false, "These users are already friends");
        
        _addFriend(msg.sender, friend_key, name);
        _addFriend(friend_key, msg.sender, userList[msg.sender].name);
    }
    
    // checkAlreadyFriends
    function checkAlreadyFriends(address pubkey1, address pubkey2) internal view returns (bool) {
        if(userList[pubkey1].friendList.length > userList[pubkey2].friendList.length) {
            address tmp = pubkey1;
            pubkey1 = pubkey2;
            pubkey2 = tmp;
        }
        for(uint256 i = 0; i < userList[pubkey1].friendList.length; i++) {
            if(userList[pubkey1].friendList[i].pubkey == pubkey2) return true;
        }
        return false;
    }
    
    function _addFriend(address me, address friend_key, string memory name) internal {
        friend memory newFriend = friend(friend_key, name);
        userList[me].friendList.push(newFriend);
    }
    
    // GETMY FRIEND
    function getMyFriendList() external view returns(friend[] memory) {
        return userList[msg.sender].friendList;
    }
    
    // get chat code
    function _getChatCode(address pubkey1, address pubkey2) internal pure returns(bytes32) {
        if(pubkey1 < pubkey2) {
            return keccak256(abi.encodePacked(pubkey1, pubkey2));
        } else {
            return keccak256(abi.encodePacked(pubkey2, pubkey1));
        }
    }
    
    // SEND TEXT MESSAGE (original functionality)
    function sendMessage(address friend_key, string calldata _msg) external {
        require(checkUserExists(msg.sender), "Create an account first");
        require(checkUserExists(friend_key), "User is not registered");
        require(checkAlreadyFriends(msg.sender, friend_key), "You are not friend with the given user");
        
        bytes32 chatCode = _getChatCode(msg.sender, friend_key);
        message memory newMsg = message(
            msg.sender, 
            block.timestamp, 
            _msg, 
            MessageType.TEXT, 
            0, 
            address(0), 
            ""
        );
        allMessages[chatCode].push(newMsg);
        
        emit MessageSent(msg.sender, friend_key, MessageType.TEXT, 0);
    }
    
    // SEND MEDIA MESSAGE (Image, Video, Audio)
    function sendMediaMessage(
        address friend_key, 
        string calldata ipfsHash, 
        MessageType msgType,
        string calldata metadata
    ) external {
        require(checkUserExists(msg.sender), "Create an account first");
        require(checkUserExists(friend_key), "User is not registered");
        require(checkAlreadyFriends(msg.sender, friend_key), "You are not friend with the given user");
        require(
            msgType == MessageType.IMAGE || 
            msgType == MessageType.VIDEO || 
            msgType == MessageType.AUDIO, 
            "Invalid media message type"
        );
        
        bytes32 chatCode = _getChatCode(msg.sender, friend_key);
        message memory newMsg = message(
            msg.sender, 
            block.timestamp, 
            ipfsHash, 
            msgType, 
            0, 
            address(0), 
            metadata
        );
        allMessages[chatCode].push(newMsg);
        
        emit MediaMessageSent(msg.sender, friend_key, ipfsHash, msgType);
    }
    
    // SEND ETH/IGL WITH MESSAGE
    function sendEthWithMessage(
        address friend_key, 
        string calldata _msg
    ) external payable {
        require(checkUserExists(msg.sender), "Create an account first");
        require(checkUserExists(friend_key), "User is not registered");
        require(checkAlreadyFriends(msg.sender, friend_key), "You are not friend with the given user");
        require(msg.value > 0, "Must send some ETH");
        
        // Transfer ETH to friend
        (bool success, ) = payable(friend_key).call{value: msg.value}("");
        require(success, "ETH transfer failed");
        
        bytes32 chatCode = _getChatCode(msg.sender, friend_key);
        message memory newMsg = message(
            msg.sender, 
            block.timestamp, 
            _msg, 
            MessageType.ETH_TRANSFER, 
            msg.value, 
            address(0), 
            ""
        );
        allMessages[chatCode].push(newMsg);
        
        emit EthTransferred(msg.sender, friend_key, msg.value);
        emit MessageSent(msg.sender, friend_key, MessageType.ETH_TRANSFER, msg.value);
    }
    
    // SEND TOKENS WITH MESSAGE
    function sendTokenWithMessage(
        address friend_key, 
        string calldata _msg,
        address tokenAddress,
        uint256 amount
    ) external {
        require(checkUserExists(msg.sender), "Create an account first");
        require(checkUserExists(friend_key), "User is not registered");
        require(checkAlreadyFriends(msg.sender, friend_key), "You are not friend with the given user");
        require(supportedTokens[tokenAddress], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20 token = IERC20(tokenAddress);
        require(token.balanceOf(msg.sender) >= amount, "Insufficient token balance");
        require(token.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        
        // Transfer tokens to friend
        bool success = token.transferFrom(msg.sender, friend_key, amount);
        require(success, "Token transfer failed");
        
        bytes32 chatCode = _getChatCode(msg.sender, friend_key);
        message memory newMsg = message(
            msg.sender, 
            block.timestamp, 
            _msg, 
            MessageType.TOKEN_TRANSFER, 
            amount, 
            tokenAddress, 
            ""
        );
        allMessages[chatCode].push(newMsg);
        
        emit TokenTransferred(msg.sender, friend_key, tokenAddress, amount);
        emit MessageSent(msg.sender, friend_key, MessageType.TOKEN_TRANSFER, amount);
    }
    
    // READ MESSAGE
    function readMessage(address friend_key) external view returns(message[] memory) {
        bytes32 chatCode = _getChatCode(msg.sender, friend_key);
        return allMessages[chatCode];
    }
    
    // GET ALL APP USERS
    function getAllAppUser() public view returns(AllUserStruck[] memory) {
        return getAllUsers;
    }
    
    // UTILITY FUNCTIONS
    
    // Get messages by type
    function getMessagesByType(address friend_key, MessageType msgType) external view returns(message[] memory) {
        bytes32 chatCode = _getChatCode(msg.sender, friend_key);
        message[] memory chatMessages = allMessages[chatCode];
        
        // Count messages of specified type
        uint256 count = 0;
        for(uint256 i = 0; i < chatMessages.length; i++) {
            if(chatMessages[i].msgType == msgType) {
                count++;
            }
        }
        
        // Create array of messages of specified type
        message[] memory filteredMessages = new message[](count);
        uint256 index = 0;
        for(uint256 i = 0; i < chatMessages.length; i++) {
            if(chatMessages[i].msgType == msgType) {
                filteredMessages[index] = chatMessages[i];
                index++;
            }
        }
        
        return filteredMessages;
    }
    
    // Get total ETH received from a friend
    function getTotalEthReceived(address friend_key) external view returns(uint256) {
        bytes32 chatCode = _getChatCode(msg.sender, friend_key);
        message[] memory chatMessages = allMessages[chatCode];
        
        uint256 totalEth = 0;
        for(uint256 i = 0; i < chatMessages.length; i++) {
            if(chatMessages[i].msgType == MessageType.ETH_TRANSFER && chatMessages[i].sender == friend_key) {
                totalEth += chatMessages[i].amount;
            }
        }
        
        return totalEth;
    }
    
    // Get total tokens received from a friend for a specific token
    function getTotalTokensReceived(address friend_key, address tokenAddress) external view returns(uint256) {
        bytes32 chatCode = _getChatCode(msg.sender, friend_key);
        message[] memory chatMessages = allMessages[chatCode];
        
        uint256 totalTokens = 0;
        for(uint256 i = 0; i < chatMessages.length; i++) {
            if(chatMessages[i].msgType == MessageType.TOKEN_TRANSFER && 
                chatMessages[i].sender == friend_key && 
                chatMessages[i].tokenAddress == tokenAddress) {
                totalTokens += chatMessages[i].amount;
            }
        }
        
        return totalTokens;
    }
    
    // Emergency function to recover stuck ETH (only owner)
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
