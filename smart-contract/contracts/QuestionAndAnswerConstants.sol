// SPDX-License-Identifier: Apache 2.0
pragma solidity ^0.8.20;

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_QUESTION_AND_ANSWER = 0xcdc5f2fd;

// keccak256('Question')
bytes32 constant _QUESTION_KEY = 0x740b5adc65a801b1007fb4f83976d83f8a75bf40d03352b75d3d5b13027f983b;

// keccak256('Answer')
bytes32 constant _ANSWER_KEY = 0x13fc092a262c8f46b546749395986203797d295000487ccc3c0579b06d20162e;

// keccak256('Asker')
bytes32 constant _ASKER_KEY = 0x76462b2cb08ff6c9429dc9e0009c6a78b74bc0e37bb5afaf94df4a5453e38145;

// keccak256('AskTimestamp')
bytes32 constant _ASK_TIMESTAMP_KEY = 0xa8866758287878d914bea0299d18e613e0e66558f9e12d71da988ab71d2c00ed;

// keccak256('AnswerTimestamp')
bytes32 constant _ANSWER_TIMESTAMP_KEY = 0x9805e08297798acd1c4924ab23a24bd2aecc550eb1056030c2fe3283173f63ea;

// keccak256('Reward')
bytes32 constant _REWARD_KEY = 0x02d12311fe1ba073b437096116ddd40fe41238aea6da9290a417a616bb3fbf3f;
